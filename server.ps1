$port = 8080
$root = $PSScriptRoot

$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:$port/")
$http.Start()

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "   DapurKita Server Running!" -ForegroundColor Green
Write-Host "   http://localhost:$port" -ForegroundColor Yellow
Write-Host "   Tekan Ctrl+C untuk berhenti" -ForegroundColor Gray
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

while ($http.IsListening) {
    $ctx = $http.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $urlPath = $req.Url.LocalPath.TrimStart('/')
    if ($urlPath -eq '' -or $urlPath -eq '/') { $urlPath = 'index.html' }

    $file = Join-Path $root $urlPath

    Write-Host "  GET /$urlPath" -ForegroundColor DarkGray

    if (Test-Path $file -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css; charset=utf-8' }
            '.js'   { 'application/javascript; charset=utf-8' }
            '.jpg'  { 'image/jpeg' }
            '.jpeg' { 'image/jpeg' }
            '.png'  { 'image/png' }
            '.gif'  { 'image/gif' }
            '.svg'  { 'image/svg+xml' }
            '.ico'  { 'image/x-icon' }
            default { 'application/octet-stream' }
        }
        $res.StatusCode = 200
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 - File tidak ditemukan</h1>")
        $res.StatusCode = 404
        $res.ContentType = 'text/html'
        $res.ContentLength64 = $notFound.Length
        $res.OutputStream.Write($notFound, 0, $notFound.Length)
    }

    $res.OutputStream.Close()
}
