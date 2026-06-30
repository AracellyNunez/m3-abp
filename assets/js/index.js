// Arreglo para almacenar el histórico de pacientes analizados en la jornada 
const listadoPacientes = [];

// Valores de referencia clínicos estándar para el laboratorio
const valorMinimoHemoglobina = 12.0; // Menos de esto se considera Anemia (g/dL)
const valorMaximoHemoglobina = 17.5; // Más de esto sugiere Policitemia (g/dL)

// CALCULADORA MATEMÁTICA Y FUNCIONES

// Calcula el Volumen Corpuscular Medio (VCM)
function calcularVCM(hto, rbc) {
    return (hto * 10) / rbc;
}

// Calcula la Hemoglobina Corpuscular Media (HCM)
function calcularHCM(hb, rbc) {
    return (hb * 10) / rbc;
}

// Calcula la Concentración de Hemoglobina Corpuscular Media (CHCM)
function calcularCHCM(hb, hto) {
    return (hb * 100) / hto;
}

// Función de Filtro Clínico
function esMuestraBiologicamenteValida(hb, hto, rbc) {
    // Un hematocrito del 85% o superior es físicamente imposible 
    if (hto >= 85) {
        return false;
    }

    // Cálculo de la CHCM para valores inexistentes
    const chcmCalculada = (hb * 100) / hto;

    // Si la relación Hb/Hto da una CHCM menor a 15 o mayor a 50, los valores son un error de digitación.
    if (chcmCalculada < 15 || chcmCalculada > 50) {
        return false;
    }

    const vcmCalculado = (hto * 10) / rbc;
    if (vcmCalculado < 40 || vcmCalculado > 160) {
        return false;
    }

    return true;
}

//Clasifica el estado fisiopatológico del paciente.
function analizarMuestraHematologica(hb, vcm, hcm) {

    // Ver si los valores están por sobre el límite superior 
    if (hb > valorMaximoHemoglobina) {
        return "Hiperhemoglobinemia (Sospecha de Policitemia)";
    }

    // Ver si los resultados enstan dentro del rango normal 
    if (hb >= valorMinimoHemoglobina && hb <= valorMaximoHemoglobina) {
        return "Parámetros Hematológicos Normales";
    }

    // Si no es alta ni normal, lo arroja como anemia

    // Si los hematíes son pequeños (Microcítica)
    if (vcm < 80) {
        if (hcm < 27) return "Anemia Microcítica Hipocrómica";
        if (hcm > 33) return "Anemia Microcítica Hipercrómica";
        return "Anemia Microcítica Normocrómica";
    }

    // Si los hematíes son grandes (Macrocítica) 
    if (vcm > 100) {
        if (hcm < 27) return "Anemia Macrocítica Hipocrómica";
        if (hcm > 33) return "Anemia Macrocítica Hipercrómica";
        return "Anemia Macrocítica Normocrómica";
    }

    // Si son de tamaño normal (Normocítica) 
    if (hcm < 27) return "Anemia Normocítica Hipocrómica";
    if (hcm > 33) return "Anemia Normocítica Hipercrómica";
    return "Anemia Normocítica Normocrómica";
}

// INTERFAZ Y EVENTOS 

const formulario = document.getElementById('form-paciente');
const seccionResultado = document.getElementById('seccion-resultado');
const alertaCritica = document.getElementById('alerta-critica');

formulario.addEventListener('submit', function (e) {
    e.preventDefault(); 

    const nombre = document.getElementById('nombre').value;
    const grupo = document.getElementById('grupo').value;
    const rbc = parseFloat(document.getElementById('rbc').value);
    const hb = parseFloat(document.getElementById('hb').value);
    const hto = parseFloat(document.getElementById('hto').value);

    if (rbc <= 0 || hto <= 0 || hb <= 0) {
        alert("⚠️ Error: Todos los valores numéricos de la muestra deben ser mayores a cero.");
        return;
    }

    if (!esMuestraBiologicamenteValida(hb, hto, rbc)) {
        alert("❌ Error de Validación: Los valores ingresados no guardan coherencia biológica (Relación Hb/Hto/RBC inconsistente). Por favor, revise los datos de la muestra.");
        return; 
    }

    const vcm = parseFloat(calcularVCM(hto, rbc).toFixed(1));
    const hcm = parseFloat(calcularHCM(hb, rbc).toFixed(1));
    const chcm = parseFloat(calcularCHCM(hb, hto).toFixed(1));

    const clasificacionFinal = analizarMuestraHematologica(hb, vcm, hcm);

    // ALERTAS
    if (hb < valorMinimoHemoglobina) {
        alertaCritica.innerHTML = `🚨 ALERTA DE LABORATORIO: Paciente presenta niveles de Hemoglobina Bajos (${hb} g/dL).`;
        alertaCritica.className = "alerta";
    } else if (hb > valorMaximoHemoglobina) {
        alertaCritica.innerHTML = `🚨 ALERTA DE LABORATORIO: Paciente presenta niveles de Hemoglobina Altos (${hb} g/dL).`;
        alertaCritica.className = "alerta";
    } else {
        alertaCritica.className = "alerta hidden";
    }

    document.getElementById('res-vcm').innerText = vcm;
    document.getElementById('res-hcm').innerText = hcm;
    document.getElementById('res-chcm').innerText = chcm;
    document.getElementById('res-diagnose').innerText = clasificacionFinal;

    seccionResultado.classList.remove('hidden');

    // Objeto
    const pacienteObjeto = {
        nombre: nombre,
        grupo: grupo,
        hemoglobina: hb,
        vcm: vcm,
        hcm: hcm,
        resultado: clasificacionFinal
    };
    listadoPacientes.push(pacienteObjeto);

    actualizarTabla(pacienteObjeto);

    formulario.reset();
});

// Insertar filas dinámicamente en el historico
function actualizarTabla(paciente) {
    const tablaBody = document.querySelector('#tabla-pacientes tbody');
    const filaVacia = document.getElementById('fila-vacia');

    if (filaVacia) {
        filaVacia.remove(); 
    }

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td><strong>${paciente.nombre}</strong></td>
        <td>${paciente.grupo}</td>
        <td>${paciente.hemoglobina}</td>
        <td>${paciente.vcm}</td>
        <td>${paciente.hcm}</td>
        <td><span style="color: #800020; font-weight: bold;">${paciente.resultado}</span></td>
    `;

    tablaBody.appendChild(nuevaFila);
}