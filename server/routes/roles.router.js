const express = require("express");
<<<<<<< HEAD
const router = express.Router();  // Use express.Router() instead of express()
const Controllers = require("../controllers/roles");  // Ensure this path is correct

router.post("/roles", Controllers.Add);
router.get("/roles", Controllers.GetAll);
router.get("/roles/:id", Controllers.GetOne);
router.put("/roles/:id", Controllers.UpdateOne);
router.delete("/roles/:id", Controllers.DeleteOne);

module.exports = router;
=======
const Router = express();
const Controllers = require("../controllers/roles");

Router.post("/roles", Controllers.Add);
Router.get("/roles", Controllers.GetAll);
Router.get("/roles/:id", Controllers.GetOne);
Router.put("/roles/:id", Controllers.UpdateOne);
Router.delete("/roles/:id", Controllers.DeleteOne);

module.exports = Router;
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
