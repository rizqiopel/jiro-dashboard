<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateManagedUserRequest extends StoreManagedUserRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('users.view') && $this->user()->can('users.update');
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['email'] = ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->route('managedUser'))];

        return $rules;
    }
}
