<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function signIn(string $role = 'Admin'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        $this->actingAs($user);

        return $user;
    }

    /** @return array<string, string> */
    private function validData(): array
    {
        return ['name' => 'Reference project', 'description' => 'Shared workspace project', 'status' => 'active'];
    }

    #[DataProvider('roles')]
    public function test_actual_resource_endpoints_enforce_the_role_matrix(string $role, bool $canWrite, bool $canDelete): void
    {
        $this->signIn($role);
        $project = Project::factory()->create();
        $this->get(route('projects.index'))->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/index')->where('can.create', $canWrite)->where('can.update', $canWrite)->where('can.delete', $canDelete));
        $this->get(route('projects.show', $project))->assertOk();
        $this->get(route('projects.create'))->assertStatus($canWrite ? 200 : 403);
        $this->get(route('projects.edit', $project))->assertStatus($canWrite ? 200 : 403);
        $this->post(route('projects.store'), $this->validData())->assertStatus($canWrite ? 302 : 403);
        $this->put(route('projects.update', $project), $this->validData())->assertStatus($canWrite ? 302 : 403);
        $this->delete(route('projects.destroy', $project))->assertStatus($canDelete ? 302 : 403);
        $this->assertDatabaseCount('projects', $canWrite ? ($canDelete ? 1 : 2) : 1);
        if (! $canWrite) {
            $this->assertSame($project->name, $project->fresh()->name);
        }
    }

    /** @return array<string, array{string, bool, bool}> */
    public static function roles(): array
    {
        return ['admin' => ['Admin', true, true], 'editor' => ['Editor', true, false], 'viewer' => ['Viewer', false, false]];
    }

    public function test_guest_and_unverified_users_cannot_access_any_resource_endpoint(): void
    {
        $project = Project::factory()->create();
        $endpoints = [
            ['get', route('projects.index')], ['get', route('projects.show', $project)],
            ['get', route('projects.create')], ['get', route('projects.edit', $project)],
            ['post', route('projects.store')], ['put', route('projects.update', $project)], ['delete', route('projects.destroy', $project)],
        ];
        foreach ($endpoints as [$method, $url]) {
            $this->$method($url, $this->validData())->assertRedirect(route('login'));
        }
        $user = User::factory()->unverified()->create();
        $user->assignRole('Admin');
        $this->actingAs($user);
        foreach ($endpoints as [$method, $url]) {
            $this->$method($url, $this->validData())->assertRedirect(route('verification.notice'));
        }
        $this->assertDatabaseCount('projects', 1);
    }

    public function test_no_role_and_write_permission_without_view_are_denied(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $project = Project::factory()->create();
        $this->get(route('projects.index'))->assertForbidden();
        $this->get(route('projects.show', $project))->assertForbidden();
        $this->get(route('projects.edit', $project))->assertForbidden();
        $user->givePermissionTo(['projects.create', 'projects.update', 'projects.delete']);
        $this->get(route('projects.create'))->assertForbidden();
        $this->post(route('projects.store'), [])->assertForbidden();
        $this->put(route('projects.update', $project), [])->assertForbidden();
        $this->delete(route('projects.destroy', $project))->assertForbidden();
        $this->assertDatabaseCount('projects', 1);
    }

    public function test_create_update_show_and_delete_persist_only_validated_fields(): void
    {
        $this->signIn();
        $this->post(route('projects.store'), [...$this->validData(), 'id' => 9999, 'created_at' => '2000-01-01'])
            ->assertRedirect(route('projects.show', 1));
        $project = Project::firstOrFail();
        $this->assertNotSame(9999, $project->id);
        $this->assertDatabaseHas('projects', $this->validData());
        $this->put(route('projects.update', $project), ['name' => 'Archived project', 'description' => '', 'status' => 'archived'])
            ->assertRedirect(route('projects.show', $project));
        $this->get(route('projects.show', $project))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/show')->where('project.name', 'Archived project')->where('project.description', null)->where('project.status', 'archived'));
        $this->delete(route('projects.destroy', $project))->assertRedirect(route('projects.index'));
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->get(route('projects.show', $project))->assertNotFound();
    }

    #[DataProvider('invalidWrites')]
    public function test_invalid_create_and_update_leave_the_database_unchanged(array $changes, string $field): void
    {
        $this->signIn();
        $project = Project::factory()->create();
        $data = [...$this->validData(), ...$changes];
        $this->post(route('projects.store'), $data)->assertSessionHasErrors($field);
        $this->put(route('projects.update', $project), $data)->assertSessionHasErrors($field);
        $expected = $project->getAttributes();
        $actual = $project->fresh()->getAttributes();
        ksort($expected);
        ksort($actual);
        $this->assertSame($expected, $actual);
        $this->assertDatabaseCount('projects', 1);
    }

    /** @return array<string, array{array<string, mixed>, string}> */
    public static function invalidWrites(): array
    {
        return [
            'blank name' => [['name' => '   '], 'name'],
            'long name' => [['name' => str_repeat('x', 256)], 'name'],
            'description array' => [['description' => ['bad']], 'description'],
            'long description' => [['description' => str_repeat('x', 5001)], 'description'],
            'invalid status' => [['status' => 'deleted'], 'status'],
        ];
    }

    public function test_search_is_case_insensitive_grouped_with_status_and_treats_wildcards_literally(): void
    {
        $this->signIn('Viewer');
        $matching = Project::factory()->create(['name' => 'Budget 50%_!', 'description' => null]);
        Project::factory()->create(['name' => 'Other', 'description' => 'Budget 50%_!', 'status' => 'archived']);
        Project::factory()->create(['name' => 'Budget 50000']);
        $this->get(route('projects.index', ['search' => 'budget 50%_!', 'status' => 'active']))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('projects.total', 1)->where('projects.data.0.id', $matching->id));
    }

    public function test_search_also_matches_description(): void
    {
        $this->signIn('Viewer');
        Project::factory()->create(['name' => 'Other', 'description' => 'Needle']);
        $this->get(route('projects.index', ['search' => 'needle']))->assertInertia(fn (AssertableInertia $page) => $page->where('projects.total', 1));
    }

    public function test_sorting_and_pagination_are_server_driven_and_keep_filter_urls(): void
    {
        $this->signIn('Viewer');
        foreach (range(1, 25) as $number) {
            Project::factory()->create(['name' => sprintf('Project %02d', $number), 'status' => 'active']);
        }
        $this->get(route('projects.index', ['search' => 'Project', 'status' => 'active', 'sort' => 'name', 'direction' => 'asc', 'per_page' => 10, 'page' => 2]))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('projects.total', 25)->where('projects.current_page', 2)->where('projects.last_page', 3)->has('projects.data', 10)
                ->where('projects.data.0.name', 'Project 11')->where('projects.data.9.name', 'Project 20')
                ->where('projects.next_page_url', fn (string $url): bool => str_contains($url, 'search=Project') && str_contains($url, 'sort=name') && str_contains($url, 'page=3')));
        $this->get(route('projects.index', ['sort' => 'name', 'direction' => 'desc']))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('projects.data.0.name', 'Project 25'));
    }

    public function test_equal_sort_values_have_a_stable_id_tiebreaker(): void
    {
        $this->signIn();
        $projects = Project::factory()->count(2)->create(['name' => 'Same']);
        $this->get(route('projects.index', ['sort' => 'name', 'direction' => 'asc']))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('projects.data.0.id', $projects->last()->id));
    }

    #[DataProvider('invalidQueries')]
    public function test_invalid_query_parameters_redirect_to_a_safe_list(array $query, string $field): void
    {
        $this->signIn('Viewer');
        $this->get(route('projects.index', $query))->assertRedirect(route('projects.index'))->assertSessionHasErrors($field);
    }

    /** @return array<string, array{array<string, mixed>, string}> */
    public static function invalidQueries(): array
    {
        return [
            'sort injection' => [['sort' => 'name desc; DROP TABLE projects'], 'sort'],
            'direction' => [['direction' => 'random'], 'direction'],
            'page zero' => [['page' => 0], 'page'],
            'page huge' => [['page' => 1000001], 'page'],
            'page decimal' => [['page' => '1.5'], 'page'],
            'page size' => [['per_page' => 10000], 'per_page'],
            'status' => [['status' => 'deleted'], 'status'],
            'search array' => [['search' => ['bad']], 'search'],
            'search too long' => [['search' => str_repeat('x', 201)], 'search'],
        ];
    }

    public function test_out_of_range_page_redirects_to_the_last_real_page(): void
    {
        $this->signIn();
        Project::factory()->count(11)->create();
        $this->get(route('projects.index', ['page' => 999, 'sort' => 'name']))
            ->assertRedirect(route('projects.index', ['search' => '', 'status' => '', 'sort' => 'name', 'direction' => 'desc', 'per_page' => 10, 'page' => 2]));
    }

    public function test_missing_project_is_not_found_and_empty_list_has_correct_totals(): void
    {
        $this->signIn();
        $this->get(route('projects.show', 9999))->assertNotFound();
        $this->get(route('projects.edit', 9999))->assertNotFound();
        $this->put(route('projects.update', 9999), $this->validData())->assertNotFound();
        $this->delete(route('projects.destroy', 9999))->assertNotFound();
        $this->get(route('projects.index'))->assertInertia(fn (AssertableInertia $page) => $page->has('projects.data', 0)->where('projects.total', 0));
    }

    public function test_missing_project_preserves_the_selected_locale(): void
    {
        $this->signIn();
        $this->withSession(['locale' => 'en'])->get(route('projects.show', 9999))
            ->assertNotFound()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')->where('locale', 'en')->where('status', 404));
    }
}
