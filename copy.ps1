<#
.SYNOPSIS
    원격 서버에서 로컬 컴퓨터로 파일을 복사하는 스크립트

.DESCRIPTION
    UNC 경로(네트워크 공유)를 통해 원격 서버의 파일을 로컬 폴더로 복사합니다.
    와일드카드를 사용하여 특정 파일만 선택 가능하며, 하위 폴더도 함께 복사할 수 있습니다.

.PARAMETER RemotePath
    원격 서버의 공유 폴더 경로 (예: \\ServerName\SharedFolder)

.PARAMETER LocalPath
    파일을 저장할 로컬 폴더 경로 (예: C:\Downloads)

.PARAMETER FileName
    복사할 파일명 또는 패턴 (예: *.txt, *.log, file.txt)
    기본값은 * (모든 파일)

.PARAMETER Recursive
    하위 폴더를 포함하여 복사할지 여부 ($true 또는 $false)
    기본값은 $true

.EXAMPLE
    .\copy.ps1
    기본값으로 모든 파일 복사

.EXAMPLE
    .\copy.ps1 -RemotePath "\\192.168.1.100\backup" -LocalPath "C:\Backup" -FileName "*.txt"
    특정 서버의 txt 파일만 복사

.NOTES
    작성 날짜: 2026-02-24
    필요한 권한: 원격 공유 폴더 접근 권한 필요
#>

param(
    # 원격 서버의 공유 폴더 경로 (UNC 경로 형식 사용)
    [string]$RemotePath = "\\RemoteComputer\SharedFolder",
    
    # 파일을 저장할 로컬 폴더 경로
    [string]$LocalPath = "C:\LocalFolder",
    
    # 복사할 파일명 필터 (와일드카드 사용 가능: *.txt, *.log 등)
    [string]$FileName = "*",
    
    # 하위 폴더도 함께 복사할지 여부 ($true: 복사, $false: 현재 폴더만)
    [bool]$Recursive = $true
)

#region 함수 정의

<#
.SYNOPSIS
    원격 경로에서 로컬 경로로 파일 복사

.DESCRIPTION
    지정된 원격 경로의 파일들을 로컬 경로에 복사합니다.
    오류 발생 시 try-catch로 처리하여 스크립트 실행을 중단합니다.
#>
function Copy-RemoteToLocal {
    param(
        # 원격 서버의 공유 폴더 경로
        [string]$RemotePath,
        
        # 파일을 저장할 로컬 폴더 경로
        [string]$LocalPath,
        
        # 복사할 파일명 필터
        [string]$FileName,
        
        # 하위 폴더 포함 여부
        [bool]$Recursive
    )

    try {
        # ========================================
        # 1단계: 로컬 경로 확인 및 생성
        # ========================================
        if (-not (Test-Path -Path $LocalPath)) {
            Write-Host "로컬 폴더가 없습니다. 생성 중..." -ForegroundColor Yellow
            # 로컬 폴더가 없으면 새로 생성 (상위 폴더도 함께 생성)
            New-Item -ItemType Directory -Path $LocalPath -Force | Out-Null
            Write-Host "폴더 생성 완료: $LocalPath" -ForegroundColor Green
        }

        # ========================================
        # 2단계: 원격 경로 접근성 검증
        # ========================================
        if (-not (Test-Path -Path $RemotePath)) {
            # 원격 경로에 접근할 수 없으면 예외 발생
            throw "원격 경로에 접근할 수 없습니다: $RemotePath`n원격 서버가 켜져있는지, 공유 폴더 권한이 있는지 확인하세요."
        }

        # ========================================
        # 3단계: 복사 시작
        # ========================================
        Write-Host "`n========== 파일 복사 시작 ==========" -ForegroundColor Green
        Write-Host "원본 경로: $RemotePath" -ForegroundColor Cyan
        Write-Host "대상 경로: $LocalPath" -ForegroundColor Cyan
        Write-Host "파일 필터: $FileName" -ForegroundColor Cyan
        Write-Host "하위폴더 포함: $Recursive" -ForegroundColor Cyan
        Write-Host "================================`n" -ForegroundColor Green

        # ========================================
        # 4단계: Copy-Item을 이용한 파일 복사
        # ========================================
        if ($Recursive) {
            # 하위 폴더도 함께 복사 (-Recurse 옵션 사용)
            Copy-Item -Path "$RemotePath\$FileName" -Destination $LocalPath -Recurse -Force
        } else {
            # 현재 폴더의 파일만 복사 (하위 폴더는 제외)
            Copy-Item -Path "$RemotePath\$FileName" -Destination $LocalPath -Force
        }

        # ========================================
        # 5단계: 완료 메시지
        # ========================================
        Write-Host "✓ 복사 완료!" -ForegroundColor Green
    }
    catch {
        # 오류 발생 시 에러 메시지 출력 및 스크립트 종료
        Write-Host "`n✗ 오류 발생: $_" -ForegroundColor Red
        Write-Host "스크립트 실행 중단" -ForegroundColor Red
        exit 1
    }
}

#endregion

#region 스크립트 실행

# 정의된 함수 호출 (위에서 설정한 매개변수 전달)
Copy-RemoteToLocal -RemotePath $RemotePath -LocalPath $LocalPath -FileName $FileName -Recursive $Recursive

Write-Host "`n" # 마지막에 줄바꿈 추가

#endregion
