function exec
{
    param
    (
        [ScriptBlock] $ScriptBlock,
        [string] $outputFile = $false
    )
 
    $backupErrorActionPreference = $script:ErrorActionPreference
 
    $script:ErrorActionPreference = "Continue"
    try {
      if ($outputFile -eq $false) {
        & $ScriptBlock 2>&1 | % ToString
      } else {
        & $ScriptBlock 2>&1 | % ToString > $outputFile
      }
      if ($LASTEXITCODE -ne 0) {
          throw "Execution failed with exit code $LASTEXITCODE"
      }
    } finally {
      $script:ErrorActionPreference = $backupErrorActionPreference
    }
}