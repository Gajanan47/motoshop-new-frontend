const db = require("../config/db");

exports.addToWishlist = async (req, res) => {
    try {

        const userId = req.user.id;
        const { productId } = req.body;

        await db.query(
            "INSERT IGNORE INTO wishlist(user_id, product_id) VALUES(?,?)",
            [userId, productId]
        );

        res.json({
            success: true,
            message: "Added to wishlist"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};


exports.getWishlist = async (req, res) => {

    try {

        const userId = req.user.id;

        const [rows] = await db.query(`
            SELECT
                p.*,
                JSON_ARRAYAGG(pi.url) AS images
            FROM wishlist w
            JOIN products p
                ON w.product_id=p.id
            LEFT JOIN product_images pi
                ON p.id=pi.product_id
            WHERE w.user_id=?
            GROUP BY p.id
        `,[userId]);

        res.json({
            success:true,
            data:rows
        });

    } catch(err){

        res.status(500).json({
            success:false,
            error:err.message
        });

    }

};


exports.removeFromWishlist = async(req,res)=>{

    try{

        const userId=req.user.id;
        const productId=req.params.productId;

        await db.query(
            "DELETE FROM wishlist WHERE user_id=? AND product_id=?",
            [userId,productId]
        );

        res.json({
            success:true,
            message:"Removed"
        });

    }catch(err){

        res.status(500).json({
            success:false,
            error:err.message
        });

    }

};