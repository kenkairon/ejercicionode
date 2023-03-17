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

    router.get('/abandono', (req, res) => {
        let abandonoPilotos = {};
        // Loop through each race result
        for (let carrera of carreras) {
            let abandono = carrera.abandono.toUpperCase();
            let piloto = carrera.piloto;
          // If the driver abandoned the race, increment their count
            if (abandono === "SI") {
                if (abandonoPilotos[piloto]) {
                    abandonoPilotos[piloto]++;
                } else {
                    abandonoPilotos[piloto] = 1;
                }
            }
        }
        let rankingAbandono = [];
        // Convert the object to an array and sort by number of abandonments
        for (let piloto in abandonoPilotos) {
            rankingAbandono.push({ piloto: piloto, abandonos: abandonoPilotos[piloto] });
        }
        rankingAbandono.sort((a, b) => b.abandonos - a.abandonos);
        res.render('abandono.ejs', { rankingAbandono });
});
//-------------------------------------------------------------------------------------------------------
// REALIZA LA  SUMA PUNTAJES
function calcularPuntajes(resultados) {
    const puntajes = {};
    resultados.forEach((resultado) => {
        const escuderia = resultado.escuderia;
        const puntos = parseInt(resultado.puntaje);
        if (puntajes[escuderia]) {
        puntajes[escuderia] += puntos;
        } else {
        puntajes[escuderia] = puntos;
        }
    });
    return puntajes;
}
function ordenarPuntajes(puntajes) {
    // El método Object.fromEntries clave y valor
    const puntajesOrdenados = Object.fromEntries(
        // ordena los puntajes a y b
        Object.entries(puntajes).sort((a, b) => b[1] - a[1])
    );
    return puntajesOrdenados;
}
router.get('/puntajes', (req, res) => {
    const puntajes = calcularPuntajes(resultados);
    const puntajesOrdenados = ordenarPuntajes(puntajes);
    res.render('puntajes.ejs', { puntajes: puntajesOrdenados });
    });


//tabla
function calcularPuntaje(resultado) {
    let posicion = parseInt(resultado.ubicacion);
    if (posicion <= 10) {
      switch (posicion) {
        case 1:
          return 25;
        case 2:
          return 18;
        case 3:
          return 15;
        case 4:
          return 12;
        case 5:
          return 10;
        case 6:
          return 8;
        case 7:
          return 6;
        case 8:
          return 4;
        case 9:
          return 2;
        case 10:
          return 1;
      }
    } else {
      return 0;
    }
  }
router.get('/new-resultados', (req, res) => {
  let resultadosConPuntaje = resultados.map((resultado) => ({
    ...resultado,
    puntaje: calcularPuntaje(resultado),
  }));

  res.render('resultados.ejs', {resultadosConPuntaje,circuitos,resultados});
});

module.exports = router;

