import QRCode from 'qrcode';

export async function generateQRCode(data) {
    try {
        const qrData = JSON.stringify({
            orderId: data.id,
            table: data.table,
            total: data.total,
            timestamp: new Date().toISOString()
        });
        
        const qrCode = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 200
        });
        
        return qrCode;
    } catch (error) {
        console.error('QR kod oluşturulurken hata:', error);
        return null;
    }
} 