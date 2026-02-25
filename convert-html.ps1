# Convert HTML files to EJS with path fixes

function Convert-HtmlToEjs {
    param (
        [string]$Source,
        [string]$Dest
    )
    
    $content = Get-Content $Source -Raw -Encoding UTF8
    
    # Fix paths
    $content = $content -replace 'href="media/', 'href="/media/'
    $content = $content -replace 'src="media/', 'src="/media/'
    $content = $content -replace "href='media/", "href='/media/"
    $content = $content -replace "src='media/", "src='/media/"
    
    # Fix links
    $content = $content -replace 'href="login.html"', 'href="/auth/login"'
    $content = $content -replace 'href="index.html"', 'href="/"'
    $content = $content -replace 'href="Index.html"', 'href="/"'
    $content = $content -replace 'href="aboutUs.html"', 'href="/about"'
    $content = $content -replace 'href="about.html"', 'href="/about"'
    $content = $content -replace 'Index.html #Services', '/#Services'
    $content = $content -replace 'Index.html #medicalTeam', '/#medicalTeam'
    $content = $content -replace 'Index.html #foot', '/#footerBar'
    $content = $content -replace 'index.html#Services', '/#Services'
    $content = $content -replace 'index.html #Services', '/#Services'
    $content = $content -replace 'index.html #medicalTeam', '/#medicalTeam'
    
    # Fix CDN to local
    $content = $content -replace 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', '/vendor/fontawesome/css/all.min.css'
    $content = $content -replace 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css', '/vendor/fontawesome/css/all.min.css'
    $content = $content -replace 'https://cdn.jsdelivr.net/npm/chart.js', '/vendor/chart.js/dist/chart.umd.js'
    
    Set-Content -Path $Dest -Value $content -Encoding UTF8
    Write-Host "Created: $Dest"
}

$baseSrc = "D:\mid_point\smart medipoint"
$baseDest = "D:\mid_point\src\domains"

# Convert files
Convert-HtmlToEjs "$baseSrc\Index.html" "$baseDest\site\views\index.ejs"
Convert-HtmlToEjs "$baseSrc\aboutUs.html" "$baseDest\site\views\about.ejs"
Convert-HtmlToEjs "$baseSrc\login.html" "$baseDest\auth\views\login.ejs"
Convert-HtmlToEjs "$baseSrc\adminSystem.html" "$baseDest\admin\views\dashboard.ejs"
Convert-HtmlToEjs "$baseSrc\doctor.html" "$baseDest\doctor\views\dashboard.ejs"
Convert-HtmlToEjs "$baseSrc\patient.html" "$baseDest\patient\views\dashboard.ejs"

Write-Host "`nAll files converted successfully!"
