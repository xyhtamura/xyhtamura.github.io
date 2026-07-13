param([string]$Path)
$t=[IO.File]::ReadAllText($Path)
$s=$t.IndexOf('</header>')+9
$e=$t.IndexOf('</body>')
$region=$t.Substring($s,$e-$s)
$n=[Text.Encoding]::UTF8.GetByteCount($region)
"$n / 2048 bytes ($(2048-$n) left)"
