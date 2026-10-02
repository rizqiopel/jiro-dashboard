<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApplicationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.view') && $this->user()->can('settings.update');
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'revision' => ['required', 'integer', 'min:0'],
            'name' => ['required', 'string', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'logo' => ['nullable', 'string', 'max:255', function (string $attribute, mixed $value, Closure $fail): void {
                if (! is_string($value) || ! preg_match('~^/(?:[a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]+\.(svg|png|jpe?g|webp|gif|ico)$~', $value)) {
                    $fail(__('Use an existing public image path, such as /jiro-icon.svg.'));

                    return;
                }
                $path = realpath(public_path(ltrim($value, '/')));
                $root = realpath(public_path()).DIRECTORY_SEPARATOR;
                if (! $path || ! str_starts_with($path, $root) || ! is_file($path)) {
                    $fail(__('Use an existing public image path, such as /jiro-icon.svg.'));
                }
            }],
            'support_email' => ['nullable', 'string', 'email', 'max:255'],
            'support_url' => ['nullable', 'string', 'url:https', 'max:500'],
            'default_locale' => ['required', 'string', Rule::in(config('jiro.locales'))],
            'appearance' => ['required', 'string', Rule::in(['light', 'dark', 'system'])],
            'accent' => ['required', 'string', Rule::in(['teal', 'blue', 'violet', 'orange', 'slate'])],
            'sidebar' => ['required', 'string', Rule::in(['light', 'dark'])],
            'radius' => ['required', 'string', Rule::in(['square', 'rounded', 'soft'])],
        ];
    }
}
