const path = require('path');
const express =  require('express');
const mongoose = require('mongoose');
const dotenv = require ('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const connectDb = require('./config/db');
const { urlencoded } = require('express');


//load config
dotenv.config({path : './config/config.env'});

//passport config
require('./config/passport')(passport)

connectDb();

const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

//method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


//logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//handerbars helper
const {formateDate ,truncate,stripTags , editIcon,select} = require('./helper/hbs');
//handlebars
app.engine('.hbs', exphbs({
  helpers:{
    formateDate,
    truncate,
    stripTags,
    editIcon,
    select
  },
  defaultLayout: 'main' , extname: '.hbs'
}));
app.set('view engine', '.hbs');

//session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store : new MongoStore ({mongooseConnection : mongoose.connection})
  }))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//global var
app.use(function(req ,res, next){
  res.locals.user = req.user || null
  next()
})

//static folder
app.use(express.static(path.join(__dirname , 'public')));

//routes
app.use('/' , require('./routes/index'));
app.use('/auth' , require('./routes/auth'));
app.use('/stories' , require('./routes/stories'));

const PORT = process.env.PORT || 5000;

app.listen(PORT , console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`));