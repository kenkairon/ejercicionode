const {Router} = require('express');
const router = Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const equipos= JSON.parse(fs.readFileSync('src/equipos.json', 'utf8'));
const circuitos= JSON.parse(fs.readFileSync('src/circuitos.json', 'utf8'));
const escuderia= JSON.parse(fs.readFileSync('src/equipos.json', 'utf8'));
const resultados = JSON.parse(fs.readFileSync('src/resultados.json', 'utf8'))
// esto se hace como un recopilador del dato anterior va guardar los datos que tenia antes
const json_resultado =fs.readFileSync('src/resultados.json','utf8');
let carreras = JSON.parse(json_resultado);



router.get('/',(req,res) => {
    res.render('index.ejs',{
        carreras
    })
});

//Configuro la ruta GET
router.get('/new-ingreso',(req,res)=>{
    res.render('competencia.ejs',{equipos,circuitos,escuderia});
});

//Configuro la ruta POST
router.post('/new-ingreso',(req,res)=>{
     console.log(req.body);
    const {piloto,minutos,ubicacion,abandono,puntaje,circuitos,escuderia}=req.body;
    // Validamos los datos de la Carrera
    if(!piloto || !minutos || !ubicacion || !abandono|| !puntaje || !circuitos ||!escuderia){
        res.status(400).send("Escribe todos los campos por favor");
        return;
    }
    let newCarrera ={
        id:uuidv4(),
        circuitos,
        piloto,
        minutos,
        ubicacion,
        abandono,
        puntaje,
        escuderia
    };
    //Agrega los Datos de la nueva Carrera
    carreras.push(newCarrera);

    //convertir la lista en un string
    const json_resultado =JSON.stringify(carreras);
    //Permite escribir un archivo de manera asincrona y lee un ruta relativa guardando en la forma de caracteres utf-8 y guardando json_resultado
    fs.writeFileSync('src/resultados.json',json_resultado,'utf8');

    res.redirect('/');
});

router.get('/delete/:id',(req,res)=>{
    carreras= carreras.filter(carrera => carrera.id != req.params.id)
    const json_resultado =JSON.stringify(carreras);
    //Permite escribir un archivo de manera asincrona y lee un ruta relativa guardando en la forma de caracteres utf-8 y guardando json_resultado
    fs.writeFileSync('src/resultados.json',json_resultado,'utf8');
    res.redirect('/');

});
router.get('/new-resultado',(req,res)=>{
    res.render('resultados.ejs',{equipos,circuitos,escuderia,resultados});
});
module.exports = router;