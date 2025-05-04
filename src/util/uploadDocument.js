const cloudinary = require("./cloudinary");

const uploadImage = async (base64Image, folder = 'leave/documents', public_id) => {
    try {
        const options = {
            folder,
            public_id,
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif','pdf','docx','doc'],
            access_mode: 'public',
            resource_type: 'raw',
        };

        const result = await cloudinary.uploader.upload(base64Image, options);
        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        throw new Error('Failed to upload image to server');
    }
};

module.exports = uploadImage;
