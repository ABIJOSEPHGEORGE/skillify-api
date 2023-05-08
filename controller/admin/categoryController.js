const Category = require("../../models/categorySchema");
const { error,success } = require("../../responseApi");
const fs = require('fs')

module.exports = {
    addCategory:async(req,res)=>{
        try{
           
            // getting category details
            let {category_name,category_description} = req.body;
            // converting category name into lowercase
            category_name = req.body.category_name.split(" ").join("-").toLowerCase()
            //checking whether category already exist 
            const isExist = await Category.findOne({category_name:category_name});
            if(isExist){
                return res.status(409).json(error("Category name already exist, choose another one"));
            }
            // creating new category
            await Category.create({category_name:category_name,category_description:category_description,category_image:req.file.path});
            return res.status(201).json(success('OK'));
            
        }catch(err){
           
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    getAllCategory:async(req,res)=>{
        try{
            //getting all category
            const category = await Category.find();
            return res.status(200).json(success("OK",{categories:category}));
        }catch(err){
        
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    updateCategoryStatus:async(req,res)=>{
        try{
            //getting the status & id
            const status = req.query.status;
            const category_id = req.params.id;
            //updating the category
            await Category.findOneAndUpdate({_id:category_id},{status:status});
            return res.status(200).json(success("OK"));
        }catch(err){
            return res.status(500).json(error("Something went wrong, Try after sometime"))
        }
    },
    deleteCategory:async(req,res)=>{
        try{
            //deleting the category
            const category = await Category.findOneAndDelete({_id:req.params.id});
            //deleting the category image
            fs.unlinkSync(category.category_image);
            return res.status(200).json(success("OK"));
        }catch(err){
            return res.status(500).json(error("Something went wrong, Try after sometime"))
        }
    },
    getCategory:async(req,res)=>{
        try{
            //getting the category details
            const category = await Category.findById(req.params.id);
            return res.status(200).json(success("OK",{data:category}));
        }catch(err){
            return res.status(500).json(error("Something went wrong, Try after sometime"))
        }
    },
    editCategory:async(req,res)=>{
        try{
            let {category_name,category_description} = req.body
            //checking the whether the image is changed
            let category_image;
            if(req.file){
                category_image = req.file.path;
            }else{
                category_image = req.body.category_image;
            }
            
            category_name = category_name.split(" ").join("-").toLowerCase()
            // checking whether the category name already exist
            const previousCategory = await Category.findById(req.params.id);
            const isExist = await Category.findOne({category_name:category_name})
            if(isExist && previousCategory.category_name!==category_name){
                return res.status(409).json(error("Category name already exist, Choose another one"));
            }
            //updating the category
            const category = await Category.findOneAndUpdate({_id:req.params.id},{category_name:category_name,category_description:category_description,category_image:category_image});
            // deleting the previous image if changed
            if(req.file){
                fs.unlinkSync(category.category_image)
            }
            return res.status(200).json(success("OK"));
        }catch(err){
           
            return res.status(500).json(error("Something went wrong, Try after sometime"))
        }
    },
    /*==================Subcategory Management================*/
    addSubcategory:async(req,res)=>{
        try{
            // getting category details
            let {sub_category_name,sub_category_description,parent_category} = req.body;
            // converting subcategory name into lowercase
            sub_category_name = req.body.sub_category_name.split(" ").join("-").toLowerCase()
            //checking whether subcategory already exist 
            const isExist = await Category.findOne({_id:parent_category,"sub_category.sub_category_name":sub_category_name});
            if(isExist){
                return res.status(409).json(error("Category name already exist, choose another one"));
            }
            // creating new category
            await Category.findOneAndUpdate({_id:parent_category},{$addToSet:{sub_category:{sub_category_name:sub_category_name,sub_category_description:sub_category_description}}});
            return res.status(201).json(success('OK'));
            
        }catch(err){
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    allSubCategory:async(req,res)=>{
        try{
            const categories = await Category.find({}, {category_name: 1, sub_category: 1})
            const subcategories = [];
            categories.forEach(category => {
            category.sub_category.forEach(subCategory => {
                subcategories.push({
                    parent_category_name: category.category_name,
                    parent_category_id: category._id,
                    sub_category_id : subCategory._id,
                    sub_category_name: subCategory.sub_category_name,
                    sub_category_description: subCategory.sub_category_description
                });
            });
            })
            return res.status(200).json(success("OK",{subcategories:subcategories}))
        }catch(err){
           
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    getSubCategory:async(req,res)=>{
        try{
            const subId = req.params.sub;
            const parId = req.params.id;
            //getting the subcategory
            const subcategory = await Category.findOne({_id:parId,sub_category:{$elemMatch:{_id:subId}}},{ "sub_category.$": 1, category_name: 1, _id: 0 });
            return res.status(200).json(success("OK",{subcategory:subcategory}))
        }catch(err){
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    parentSubCategories:async(req,res)=>{
        try{
            const category = req.params.id;
            //getting all subcategories
            const subcategories = await Category.findOne({_id:category})
            return res.status(200).json(success("OK",subcategories))
        }catch(err){
       
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    editSubCategory:async(req,res)=>{
        try{
            const subId = req.params.sub;
            let {sub_category_name,sub_category_description,parent_category} = req.body;
            //converting the sub category name
            sub_category_name = sub_category_name.split("-").join(" ");
            //getting the current values
            const currValue = await Category.findOne({sub_category:{$elemMatch:{_id:subId}}},{ "sub_category.$": 1, category_name: 1, _id: 0 });
            //checking whether subcategory name exist if changed
           
            const isExist = await Category.findOne({category_name:parent_category,sub_category:{$elemMatch:{sub_category_name:sub_category_name}}});
            if(sub_category_name!==currValue.sub_category[0].sub_category_name && isExist){
                return res.status(409).json(error("Subcategory name already exist, Please choose another one"));
            }
            //checking whether the category has changed or not
            if(parent_category===currValue.category_name){
                //updating the details
                await Category.findOneAndUpdate({category_name:parent_category,"sub_category._id":subId},{"$set":{"sub_category.$.sub_category_name":sub_category_name,"sub_category.$.sub_category_description":sub_category_description}});
            }else{
                //deleting the sub category from previous category
                await Category.findOneAndUpdate({category_name:currValue.category_name},{$pull:{sub_category:{_id:subId}}});
                //creating new sub category in category
                await Category.findOneAndUpdate({category_name:parent_category},{$addToSet:{sub_category:{sub_category_name:sub_category_name,sub_category_description:sub_category_description}}});
            }

            return res.status(200).json(success("OK"));
            
        }catch(err){
        
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    },
    deleteSubCategory:async(req,res)=>{
        try{
            const subId = req.params.sub;
            const parId = req.params.id;
            //deleting the sub category from previous category
            await Category.findOneAndUpdate({_id:parId},{$pull:{sub_category:{_id:subId}}});
            return res.status(200).json(success("OK"));
        }catch(err){
          
            return res.status(500).json(error("Something went wrong, Try after sometime"));
        }
    }
}