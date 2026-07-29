const db = require("../config/db")

const getReviews = async(req, res) =>{
    try{
        const {productId} = req.params
        const [rows] = await db.query(`SELECT id, user_name, rating, comment, created_at
                                        FROM reviews WHERE product_id = ? 
                                        ORDER BY created_at DESC`, [productId])

        res.json({success: true, data: rows})                                
    }
    catch(err){
        res.status(500).json({success: false, message: err.message})
    }
}

const addReviews = async(req, res) => {
    try{
        
        const {productId} = req.params
        const {rating, comment} = req.body
        const userId = req.user.id

        const [[user]] = await db.query(`SELECT name FROM users WHERE id =?`, [userId]);
        const userName = user.name;

        if(!rating || !comment){
            return res.status(404).json({success:false, message: "Rating and comment both are required"})
        }

        if(rating < 1 || rating >5){
            return res.status(400).json({success:false, message: "Rating must be between 1 and 5"})
        }

        const [product] = await db.query('SELECT id FROM products WHERE id=?', [productId])
        if(product.length===0){
            return res.status(404).json({
                success:false, 
                message: "Product Not Found"
            })
        }
        await db.query(`INSERT INTO reviews (product_id, user_id, user_name, rating, comment) 
            VALUES(?,?,?,?,?) 
            ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = NOW()`, [productId, userId, userName, rating, comment])
    
        await db.query(`UPDATE products SET 
                        rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ?),
                        
                        reviews = (SELECT count(*) FROM reviews WHERE product_id=?)
                        WHERE id =?`, [productId, productId, productId])

        res.json({success:true, message:"Review addedd successfully"})                
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
    
}

const deleteReview = async(req,res) => {
    try{
        const {productId} = req.params
        const userId = req.user.id

        const [existing] = await db.query(`SELECT id from reviews WHERE product_id = ? AND user_id = ?`, [productId, userId])
        if(existing.length === 0){
            return res.status(404).json({success:false, message:"review not found"})
        }
        await db.query(`DELETE FROM reviews WHERE product_id = ? AND user_id = ?`,[productId, userId])
        await db.query(`UPDATE products SET 
            rating = COALESCE((SELECT ROUND(AVG(rating), 1)FROM reviews WHERE product_id=?),0),
            reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)WHERE id = ?`, [productId, productId, productId])

        res.json({success:true, message: "review deleted successfully"})    
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}

module.exports = {getReviews, addReviews, deleteReview}