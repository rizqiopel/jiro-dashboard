<?php

namespace App\Http\Controllers;

use App\Actions\ManageUsers;
use App\Actions\RecordActivity;
use App\Http\Requests\StoreManagedUserRequest;
use App\Http\Requests\UpdateManagedUserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        Gate::authorize('users.view');
        $validator = validator($request->query(), [
            'search' => ['nullable', 'string', 'max:200'],
            'role' => ['nullable', 'string', Rule::in(array_keys(config('jiro.roles')))],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
        ]);
        if ($validator->fails()) {
            return to_route('users.index')->withErrors($validator);
        }
        $values = $validator->validated();
        $filters = ['search' => $values['search'] ?? '', 'role' => $values['role'] ?? '', 'status' => $values['status'] ?? ''];
        $query = User::query()->select(['id', 'name', 'email', 'email_verified_at', 'is_active', 'created_at'])->with('roles:id,name');
        if ($filters['search'] !== '') {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $filters['search']).'%';
            $query->where(fn (Builder $query) => $query->whereRaw("LOWER(name) LIKE LOWER(?) ESCAPE '!'", [$pattern])->orWhereRaw("LOWER(email) LIKE LOWER(?) ESCAPE '!'", [$pattern]));
        }
        if ($filters['role'] !== '') {
            $query->role($filters['role']);
        }
        if ($filters['status'] !== '') {
            $query->where('is_active', $filters['status'] === 'active');
        }
        $users = $query->orderByDesc('id')->paginate(10)->appends($filters);
        if ($users->currentPage() > $users->lastPage()) {
            return to_route('users.index', [...$filters, 'page' => $users->lastPage()]);
        }

        return Inertia::render('users/index', ['users' => $users, 'filters' => $filters, 'roles' => array_keys(config('jiro.roles')), 'can' => [
            'create' => Gate::allows('users.create'), 'update' => Gate::allows('users.update'), 'reset' => Gate::allows('users.reset-password'),
        ]]);
    }

    public function create(): Response
    {
        Gate::authorize('users.view');
        Gate::authorize('users.create');

        return Inertia::render('users/create', ['roles' => array_keys(config('jiro.roles'))]);
    }

    public function store(StoreManagedUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = DB::transaction(function () use ($data, $request): User {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Str::random(64)]);
            $user->is_active = (bool) $data['is_active'];
            $user->save();
            $user->assignRole($data['role']);
            app(RecordActivity::class)->record($request->user(), $user, 'user.created', ['name', 'email', 'role', 'is_active']);

            return $user;
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created. Send a password link so they can set their password.')]);

        return to_route('users.index');
    }

    public function edit(User $managedUser): Response
    {
        Gate::authorize('users.view');
        Gate::authorize('users.update');

        return Inertia::render('users/edit', ['managedUser' => $managedUser->only(['id', 'name', 'email', 'is_active', 'email_verified_at']), 'assignedRoles' => $managedUser->getRoleNames(), 'roles' => array_keys(config('jiro.roles'))]);
    }

    public function update(UpdateManagedUserRequest $request, User $managedUser): RedirectResponse
    {
        app(ManageUsers::class)->update($request->user(), $managedUser, $request->validated('name'), $request->validated('email'), $request->validated('role'), $request->boolean('is_active'));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }

    public function resetPassword(User $managedUser): RedirectResponse
    {
        Gate::authorize('users.view');
        Gate::authorize('users.reset-password');
        abort_unless($managedUser->is_active, 403);
        $status = Password::sendResetLink(['email' => $managedUser->email]);
        if ($status === Password::ResetLinkSent) {
            app(RecordActivity::class)->record(auth()->user(), $managedUser, 'user.password-link-sent');
        }
        Inertia::flash('toast', ['type' => $status === Password::ResetLinkSent ? 'success' : 'error', 'message' => __($status)]);

        return back();
    }
}
