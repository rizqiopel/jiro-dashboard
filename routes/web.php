<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ApplicationSettingsController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('preferences/locale', [LocaleController::class, 'update'])
    ->middleware('throttle:30,1')
    ->name('locale.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('application-settings', [ApplicationSettingsController::class, 'edit'])->middleware('can:settings.view')->name('application-settings.edit');
    Route::put('application-settings', [ApplicationSettingsController::class, 'update'])->name('application-settings.update');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])->whereUuid('notification')->name('notifications.read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->whereUuid('notification')->name('notifications.destroy');
    Route::get('activity-log', [ActivityLogController::class, 'index'])->middleware('can:activity.view')->name('activity.index');
    Route::resource('users', UserManagementController::class)->only(['index', 'create', 'store', 'edit', 'update'])->parameters(['users' => 'managedUser']);
    Route::post('users/{managedUser}/reset-password', [UserManagementController::class, 'resetPassword'])->middleware('throttle:10,1')->name('users.reset-password');
    Route::inertia('documentation', 'documentation')->name('documentation');
    Route::inertia('help', 'help')->name('help');
    Route::resource('projects', ProjectController::class);
    Route::inertia('dashboard', 'dashboard')
        ->middleware('can:dashboard.view')
        ->name('dashboard');
});

require __DIR__.'/settings.php';

Route::any('{fallbackPlaceholder}', fn () => abort(404))
    ->where('fallbackPlaceholder', '.*')
    ->fallback();
