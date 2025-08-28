<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
        <title>Lixus Community Platform</title>
        
        {{-- Vite akan menyisipkan tag CSS & JS di sini --}}
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body>
        {{-- Aplikasi React Anda akan berjalan di dalam div ini --}}
        <div id="app"></div>
    </body>
</html>