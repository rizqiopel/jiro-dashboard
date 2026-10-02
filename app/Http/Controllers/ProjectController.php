<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Http\Requests\IndexProjectRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(IndexProjectRequest $request): Response|RedirectResponse
    {
        $filters = [
            'search' => $request->validated('search') ?? '',
            'status' => $request->validated('status') ?? '',
            'sort' => $request->validated('sort') ?? 'created_at',
            'direction' => $request->validated('direction') ?? 'desc',
            'per_page' => (int) ($request->validated('per_page') ?? 10),
        ];
        $query = Project::query();

        if ($filters['search'] !== '') {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $filters['search']).'%';
            $query->where(function (Builder $query) use ($pattern): void {
                $query->whereRaw("LOWER(name) LIKE LOWER(?) ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(description) LIKE LOWER(?) ESCAPE '!'", [$pattern]);
            });
        }

        if ($filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        $projects = $query->orderBy($filters['sort'], $filters['direction'])->orderByDesc('id')
            ->paginate($filters['per_page'])->appends($filters);

        if ($projects->currentPage() > $projects->lastPage()) {
            return to_route('projects.index', [...$filters, 'page' => $projects->lastPage()]);
        }

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'filters' => $filters,
            'can' => [
                'create' => Gate::allows('create', Project::class),
                'update' => $request->user()->can('projects.update'),
                'delete' => $request->user()->can('projects.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Project::class);

        return Inertia::render('projects/create');
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = DB::transaction(function () use ($request): Project {
            $project = Project::create($request->validated());
            app(RecordActivity::class)->record($request->user(), $project, 'project.created', ['name', 'description', 'status']);

            return $project;
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project created.')]);

        return to_route('projects.show', $project);
    }

    public function show(Project $project): Response
    {
        Gate::authorize('view', $project);

        return Inertia::render('projects/show', [
            'project' => $project,
            'can' => ['update' => Gate::allows('update', $project), 'delete' => Gate::allows('delete', $project)],
        ]);
    }

    public function edit(Project $project): Response
    {
        Gate::authorize('update', $project);

        return Inertia::render('projects/edit', ['project' => $project]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        DB::transaction(function () use ($request, $project): void {
            $project->refresh()->fill($request->validated());
            $fields = array_keys($project->getDirty());
            $project->save();
            if ($fields !== []) {
                app(RecordActivity::class)->record($request->user(), $project, 'project.updated', $fields);
            }
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project updated.')]);

        return to_route('projects.show', $project);
    }

    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);
        DB::transaction(function () use ($project): void {
            app(RecordActivity::class)->record(auth()->user(), $project, 'project.deleted');
            $project->delete();
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project deleted.')]);

        return to_route('projects.index');
    }
}
