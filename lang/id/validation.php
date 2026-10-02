<?php

return [
    'required' => ':attribute wajib diisi.',
    'string' => ':attribute harus berupa teks.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'confirmed' => 'Konfirmasi :attribute tidak sesuai.',
    'current_password' => 'Password saat ini tidak sesuai.',
    'unique' => ':attribute sudah digunakan.',
    'in' => ':attribute yang dipilih tidak valid.',
    'max' => ['string' => ':attribute maksimal :max karakter.'],
    'min' => ['string' => ':attribute minimal :min karakter.'],
    'password' => [
        'letters' => ':attribute harus mengandung huruf.',
        'mixed' => ':attribute harus mengandung huruf besar dan kecil.',
        'numbers' => ':attribute harus mengandung angka.',
        'symbols' => ':attribute harus mengandung simbol.',
        'uncompromised' => ':attribute pernah muncul dalam kebocoran data. Pilih password lain.',
    ],
    'attributes' => [
        'name' => 'Nama',
        'email' => 'Email',
        'password' => 'Password',
        'current_password' => 'Password saat ini',
        'locale' => 'Bahasa',
        'description' => 'Deskripsi',
        'status' => 'Status',
    ],
];
