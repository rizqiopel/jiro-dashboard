<?php

namespace App\Models;

use Database\Factories\WorkspaceSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceSetting extends Model
{
    /** @use HasFactory<WorkspaceSettingFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['values', 'revision'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['values' => 'array', 'revision' => 'integer'];
    }
}
