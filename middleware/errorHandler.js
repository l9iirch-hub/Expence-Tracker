const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    // Erreur : duplication
    if (err.code === 11000) {
        const message = 'Cette transaction existe déjà';
        error = { message, statusCode: 400 };
    }

    // Erreur de validation 
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // Erreur d'ID invalide
    if (err.name === 'CastError') {
        const message = 'ID de transaction invalide';
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;