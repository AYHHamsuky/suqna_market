<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesImageUploads
{
    /** Store a single uploaded image on the public disk, return its public URL. */
    protected function storeImage(UploadedFile $file, string $dir): string
    {
        $path = $file->store($dir, 'public');
        return Storage::disk('public')->url($path);
    }

    /**
     * Store multiple images (from a multipart array) and return their public URLs.
     *
     * @param  array<UploadedFile>  $files
     * @return array<string>
     */
    protected function storeImages(array $files, string $dir): array
    {
        return array_map(fn (UploadedFile $f) => $this->storeImage($f, $dir), $files);
    }
}
