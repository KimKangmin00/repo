// 샘플 사용자 계정 (실제 환경에서는 백엔드에서 검증해야 함)
const validUsers = {
    'admin': 'password123',
    'user': 'user1234',
    'test': 'test1234'
};

// 로그인 폼 요소 선택
const loginForm = document.getElementById('loginForm');
const userIdInput = document.getElementById('userId');
const userPasswordInput = document.getElementById('userPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberMeCheckbox = document.getElementById('rememberMe');
const successMessage = document.getElementById('successMessage');

// 비밀번호 표시/숨김 토글
togglePasswordBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const type = userPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    userPasswordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

// 입력값 검증 함수
function validateInput(input) {
    const formGroup = input.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    if (input.value.trim() === '') {
        formGroup.classList.add('error');
        errorMessage.classList.add('show');
        return false;
    } else {
        formGroup.classList.remove('error');
        errorMessage.classList.remove('show');
        return true;
    }
}

// 실시간 입력 검증
userIdInput.addEventListener('blur', function() {
    validateInput(this);
});

userPasswordInput.addEventListener('blur', function() {
    validateInput(this);
});

// 입력 중일 때 에러 메시지 제거
userIdInput.addEventListener('input', function() {
    const formGroup = this.closest('.form-group');
    if (this.value.trim() !== '') {
        formGroup.classList.remove('error');
        formGroup.querySelector('.error-message').classList.remove('show');
    }
});

userPasswordInput.addEventListener('input', function() {
    const formGroup = this.closest('.form-group');
    if (this.value.trim() !== '') {
        formGroup.classList.remove('error');
        formGroup.querySelector('.error-message').classList.remove('show');
    }
});

// 로그인 폼 제출
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 입력값 검증
    const userIdValid = validateInput(userIdInput);
    const userPasswordValid = validateInput(userPasswordInput);

    if (!userIdValid || !userPasswordValid) {
        return;
    }

    const userId = userIdInput.value.trim();
    const userPassword = userPasswordInput.value;

    // 사용자 검증
    if (checkPassword(userId, userPassword)) {
        // 로그인 성공
        successMessage.classList.add('show');
        
        // 자동 로그인 기능
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedUserId', userId);
            console.log('자동 로그인이 설정되었습니다.');
        } else {
            localStorage.removeItem('rememberedUserId');
        }

        // 2초 후 홈페이지로 이동 (실제 환경에서는 대시보드로 이동)
        setTimeout(function() {
            alert('로그인이 성공했습니다!');
            // window.location.href = '/dashboard';
            console.log('로그인 성공:', userId);
        }, 1500);
    } else {
        // 로그인 실패
        alert('아이디 또는 비밀번호가 잘못되었습니다.');
        userPasswordInput.value = '';
        userPasswordInput.focus();
    }
});

// 비밀번호 검증 함수
function checkPassword(userId, password) {
    // 아이디 존재 확인
    if (!(userId in validUsers)) {
        return false;
    }

    // 비밀번호 확인
    if (validUsers[userId] === password) {
        return true;
    }

    return false;
}

// 페이지 로드 시 저장된 아이디 불러오기
window.addEventListener('DOMContentLoaded', function() {
    const rememberedUserId = localStorage.getItem('rememberedUserId');
    if (rememberedUserId) {
        userIdInput.value = rememberedUserId;
        rememberMeCheckbox.checked = true;
        userPasswordInput.focus();
    }
});

// 테스트용 샘플 데이터
console.log('=== 샘플 계정 ===');
console.log('아이디: admin, 비밀번호: password123');
console.log('아이디: user, 비밀번호: user1234');
console.log('아이디: test, 비밀번호: test1234');
