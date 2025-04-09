import QRCode from 'qrcode';

export async function generateQRCode(data) {
    try {
        const qrCode = await QRCode.toDataURL(JSON.stringify(data), {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        return qrCode;
    } catch (error) {
        console.error('QR kod oluşturulurken hata:', error);
        throw error;
    }
} 