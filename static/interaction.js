
let app = document.querySelector('#app')

window.getInputValue = function(event){
    event.preventDefault()
    let inputValue = document.getElementById("input-id").value

    if (inputValue!=''){
        logIn(inputValue)
    } else {
        window.alert('El campo de id esta vacio')
    }
    
}

function formatDate(dateISO) {

    let myDate = new Date(dateISO);

    let optionsDate = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
    };

    let optionsHour = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true, 
    };

    let formatedDate = myDate.toLocaleDateString('es-ES', optionsDate);
    let formatedHour = myDate.toLocaleTimeString('es-ES', optionsHour);

    return `El ${formatedDate} a las ${formatedHour} hora Colombia`;
}

let dataClasses = {}

function logIn(userId){

    fetch('/log-in', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({'userId': userId})})
    .then(response => response.json())
    .then(data => {

        dataClasses = data

        console.log(dataClasses)

        if (dataClasses.available.length > 0){
            //Llamar funcion para crear container principales
            let container = createContainersAndFilters('avail')
            //Llamar funcion createCards() enviando data para iterar
            createCards(dataClasses.available, container, 'avail')
            addFilterEventListeners()

        } else if (dataClasses.reserved.length > 0){

            //Llamar funcion para crear container principales
            let container = createContainersAndFilters('reserved')
            //Llamar funcion createCards() enviando data para iterar
            createCards(dataClasses.reserved, container, 'reserved')
            addFilterEventListeners()

            } else {
            window.alert("No hay clases disponibles")
        }

    })
}

function addFilterEventListeners(){

    const availRadioButtons = document.getElementById('available');
    availRadioButtons.addEventListener("click", () => {

        removeMainContainer()
        let containerR = createContainersAndFilters('avail')
        createCards(dataClasses.available, containerR, 'avail')

    })

    const reservedRadioButtons = document.getElementById('reserved');
    reservedRadioButtons.addEventListener("click", () => {

        removeMainContainer()
        let containerR = createContainersAndFilters('reserved')
        createCards(dataClasses.reserved, containerR, 'reserved')

})

}


function createContainersAndFilters(type){

    let filtersExist = document.body.contains(document.getElementById('reserved'))
    let typeRequest = type
    const appResults = document.getElementById('app')

        // Create main container for filters
        const containerResults = document.createElement('div')
        containerResults.classList.add('main-container-results')

        if (!filtersExist){
            //create container filters
            const filtersContainer = document.createElement('div')
            filtersContainer.classList.add('radio-inputs')

            //Create filter 1 "available"
            const labelFilter1 = document.createElement('label')
            labelFilter1.classList.add('radio')

            const inputFilter1 = document.createElement('input')
            inputFilter1.type = "radio"
            inputFilter1.name = "radio"
            inputFilter1.id = "available"
            if (type==='avail') {
                inputFilter1.checked = true
            }

            const spanFilter1 = document.createElement('span')
            spanFilter1.classList.add('name')
            spanFilter1.innerText = "Disponibles"

            labelFilter1.append(inputFilter1, spanFilter1)
            filtersContainer.append(labelFilter1)
            
            //Create filter 2 "programadas"

            const labelFilter2 = document.createElement('label')
            labelFilter2.classList.add('radio')

            const inputFilter2 = document.createElement('input')
            inputFilter2.type = "radio"
            inputFilter2.name = "radio"
            inputFilter2.id = "reserved"
            if (type!='avail') {
                inputFilter2.checked = true
            }

            const spanFilter2 = document.createElement('span')
            spanFilter2.classList.add('name')
            spanFilter2.innerText = "Programadas"

            labelFilter2.append(inputFilter2, spanFilter2)
            filtersContainer.append(labelFilter2)
            
            //agregar a app
            appResults.append(filtersContainer)
        }

        // Create subtitle
        const pageSubtitle = document.createElement('h2')
        pageSubtitle.classList.add('subtitle')

        if (type==='avail'){
            pageSubtitle.innerText = "Clases disponibles"
        } else {
            pageSubtitle.innerText = "Clases programadas"
        }
        
        containerResults.append(pageSubtitle)

        //Agregar a app
        appResults.append(containerResults)

        //Llamar animacion             
        menuAnimation(containerResults)

        //Llamar funcion createCards() sending data to iterate
        // createCards(data.available, containerResults)

        return containerResults
}


function createCards(data, containerR, typeRequest){    
    // Loop for creating cards
    data.forEach((item) => {

        createButton().then(svgData => {

                const container = document.createElement('div')
                container.classList.add('container')
                
                const cardContainer = document.createElement('div')
                cardContainer.classList.add('card-container')

                const iconCalendarContainer = document.createElement('div')
                iconCalendarContainer.classList.add('card-icon-container')
                iconCalendarContainer.innerHTML = svgData

                if (typeRequest==='avail'){
                    const spanButton = document.createElement('span')
                    spanButton.classList.add('card-span-button')
                    spanButton.innerText = 'Registrar'
                    container.append(spanButton)
                }
                
                const cardBodyContainer = document.createElement('div')
                cardBodyContainer.classList.add('card-body-container')
        
                const title = document.createElement('h3')
                title.classList.add('card-title')
                title.innerText = item.teacher_name
        
                const classDate = document.createElement('p')
                classDate.classList.add('card-body')
                let formatedDate = formatDate(item.start_date)
                classDate.innerText = formatedDate

                cardBodyContainer.append(title, classDate)
                cardContainer.append(iconCalendarContainer, cardBodyContainer)
                container.append(cardContainer)
                containerR.append(container)
        
                var arrowButton = document.querySelector('.arrow')
                arrowButton.style.display = 'block'

                
                });

    })
}

function menuAnimation(){
    let w = window.innerWidth
    let animationY = -300

    if (w<500) {
        animationY = -400
    } 

    let myAnimation = anime({
        targets: ['.main-container', '.availabilityApp'],
        translateY: animationY,
        duration: 3000
    })
}

let arrow = document.getElementById('arrow-down')

arrow.addEventListener("click", (e) => {
    menuAnimationOut()
  });

function menuAnimationOut(){
    let myAnimation = anime({
        targets: ['.main-container'],
        translateY: 0,
        duration: 3000
    })
    let filtersContainer = document.querySelector('.radio-inputs')
    filtersContainer.remove()

    removeMainContainer()

    let arrowButton = document.querySelector('.arrow')
    arrowButton.style.display = 'none'

}

async function createButton() {
    const response = await fetch('/static/icons/calendar_icon.html')
    const data = await response.text()
    return data
  }

function removeMainContainer(){
    let availabilityContainer = document.querySelector('.main-container-results')
    availabilityContainer.remove()
}
