// --- FUNGSI UTILITAS FORMAT DATA ---

export const formatDiamond = (amount) => amount ? new Intl.NumberFormat('id-ID').format(amount) + ' 💎' : '0 💎';

export const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export function formatDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes === 0) return '0 menit';
    const isNegative = totalMinutes < 0;
    const absMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = Math.round(absMinutes % 60);
    let result = '';
    if (hours > 0) {
        result += `${hours} jam `;
    }
    if (minutes > 0) {
        result += `${minutes} menit`;
    }
    return (isNegative ? '- ' : '') + result.trim();
}

export const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
