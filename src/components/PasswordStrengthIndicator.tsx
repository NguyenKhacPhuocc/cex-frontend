'use client';

interface PasswordStrengthIndicatorProps {
    password: string;
}

interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    color: string;
    label: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const checkStrength = (pwd: string): PasswordStrength => {
        if (!pwd) {
            return { score: 0, feedback: [], color: '#E5E7EB', label: '' };
        }

        const feedback: string[] = [];
        let score = 0;

        // Length check
        if (pwd.length >= 8) {
            score++;
        } else {
            feedback.push('Cần ít nhất 8 ký tự');
        }

        if (pwd.length >= 12) {
            score++;
        }

        // Uppercase check
        if (/[A-Z]/.test(pwd)) {
            score++;
        } else {
            feedback.push('Thêm chữ hoa (A-Z)');
        }

        // Lowercase check
        if (/[a-z]/.test(pwd)) {
            score++;
        } else {
            feedback.push('Thêm chữ thường (a-z)');
        }

        // Number check
        if (/[0-9]/.test(pwd)) {
            score++;
        } else {
            feedback.push('Thêm số (0-9)');
        }

        // Special character check
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
            score++;
        } else {
            feedback.push('Thêm ký tự đặc biệt (!@#$...)');
        }

        // Common passwords check
        const commonPasswords = ['password', '123456', 'qwerty', 'abc123', '12345678'];
        if (commonPasswords.includes(pwd.toLowerCase())) {
            score = Math.max(0, score - 2);
            feedback.push('⚠️ Mật khẩu quá phổ biến');
        }

        // Normalize score to 0-4
        score = Math.min(4, Math.max(0, score));

        let color = '#E5E7EB';
        let label = '';

        if (score === 0) {
            color = '#F6465D';
            label = 'Rất yếu';
        } else if (score === 1) {
            color = '#F6465D';
            label = 'Yếu';
        } else if (score === 2) {
            color = '#FFA500';
            label = 'Trung bình';
        } else if (score === 3) {
            color = '#0ECB81';
            label = 'Mạnh';
        } else if (score === 4) {
            color = '#0ECB81';
            label = 'Rất mạnh';
        }

        return { score, feedback, color, label };
    };

    const strength = checkStrength(password);

    if (!password) {
        return null;
    }

    return (
        <div className="mt-2 space-y-2">
            {/* Strength bars */}
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: level <= strength.score ? strength.color : '#E5E7EB',
                        }}
                    />
                ))}
            </div>

            {/* Strength label */}
            {strength.label && (
                <div className="flex items-center justify-between">
                    <span
                        className="text-xs font-medium"
                        style={{ color: strength.color }}
                    >
                        {strength.label}
                    </span>
                </div>
            )}

            {/* Feedback list */}
            {strength.feedback.length > 0 && strength.score < 4 && (
                <ul className="text-xs text-gray-600 space-y-1 mt-2">
                    {strength.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Success message */}
            {strength.score >= 4 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span>
                    <span>Mật khẩu đủ mạnh!</span>
                </p>
            )}
        </div>
    );
}

