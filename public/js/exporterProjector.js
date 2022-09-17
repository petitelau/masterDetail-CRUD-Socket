import {EDITABLE, LABEL, VALID, VALUE,ID_OBJ} from "./presentationModel/presentationModel.js";
export { listItemProjector, formProjector }

const masterClassName = 'exporters-master';
const detailClassName = 'exporters-detail';

let saveDirty  = ()=>{}
let persist

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALUE).onChange( val=>{
        saveDirty(textAttr.getObs(ID_OBJ).getValue(), val);
    });

    inputElement.onblur = _ =>persist();

    textAttr.getObs(VALID, true).onChange(
        valid => valid
            ? inputElement.classList.remove("invalid")
            : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
            ? inputElement.removeAttribute("readonly")
            : inputElement.setAttribute("readonly", true));

    textAttr.getObs(LABEL, '').onChange(label => inputElement.setAttribute("title", label));
};

const textInputProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

const listItemProjector = (masterController, selectionController, rootElement, model, attributeNames) => {
    saveDirty =masterController.saveDirty;
    persist = masterController.persist;
    const containerItems = document.createElement("DIV");
    containerItems.setAttribute("class", "container-items");
    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removeModel(model);

    const inputElements = [];

    // master: only the first attribute on master
    const attributeName = attributeNames[0];
    const inputElement = textInputProjector(model[attributeName]);
    inputElement.onfocus = _ => {
        selectionController.setSelectedModel(model);
    }
    inputElements.push(inputElement);

    inputElement.onblur = _ => {
        inputElement.classList.remove("selected");
        inputElement.classList.add("unselected");
        persist();
    }

    selectionController.onModelSelected( selected=> {
        if (selected==model ) {
            inputElement.classList.add("selected");
            inputElement.classList.remove("unselected");
        } else {
            inputElement.classList.remove("selected");
            inputElement.classList.add("unselected");
        }

    });


    masterController.onModelRemove( (removedModel, removeMe, refresh) => {
        if (removedModel !== model) return;
        containerItems.removeChild(deleteButton);
        inputElements.forEach( inputElement => containerItems.removeChild(inputElement));
        selectionController.clearSelection();
        rootElement.removeChild(containerItems)
        console.log(refresh)
        refresh ? console.log('only refresh view') :persist(removedModel)  ;
        removeMe();
    } );


    rootElement.appendChild(containerItems);

    inputElements.forEach( inputElement => containerItems.appendChild(inputElement));
    containerItems.appendChild(deleteButton);
    selectionController.setSelectedModel(model);
};


const formProjector = (detailController, rootElement, model, attributeNames, addressAttr) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="${detailClassName}">
        </DIV>
    </FORM>`;
    divElement.style.width='100%';
    const detailFormElement = divElement.querySelector("." + detailClassName);

    // only the first attribute to bind, rest of attributes are only to display
    const attributeName = attributeNames[0];
    const labelElement = document.createElement("LABEL"); // add view for attribute of this name
    labelElement.setAttribute("for", attributeName);
    const inputElement = document.createElement("INPUT");
    inputElement.setAttribute("TYPE", "text");
    inputElement.setAttribute("SIZE", "20");
    inputElement.setAttribute("ID", attributeName);
    detailFormElement.appendChild(labelElement);
    detailFormElement.appendChild(inputElement);

    bindTextInput(model[attributeName], inputElement);
    model[attributeName].getObs(LABEL, '').onChange(label => labelElement.textContent = label);


    if (undefined !== model[attributeNames.at(1)] ) {
        const infoContainer = document.createElement("DIV");
        infoContainer.classList.add("info-container");
        const detailContainer = document.createElement("DIV");
        detailContainer.classList.add("detail-container");
        // no binding, read only
        attributeNames.slice(1).forEach(attributeName=> {
            if (undefined !== model[attributeName]) {
                const labelElement = document.createElement("SPAN");
                labelElement.innerText = model[attributeName].getObs(LABEL).getValue();
                const txtElement = document.createElement("P");
                txtElement.innerText = model[attributeName].getObs(VALUE).getValue();
                detailContainer.appendChild(labelElement);
                detailContainer.appendChild(txtElement);
            }
        });

        infoContainer.appendChild(detailContainer);
        //add address attributes to address container
        const addressContainer = document.createElement("DIV");
        addressContainer.classList.add("address-container");

        addressAttr.forEach(attributeName=>{
            if (undefined !== model[attributeName]) {
                const labelElement = document.createElement("P");
                labelElement.innerText = model[attributeName].getObs(LABEL).getValue();
                const txtElement = document.createElement("P");
                txtElement.innerText = model[attributeName].getObs(VALUE).getValue();
                addressContainer.appendChild(labelElement);
                addressContainer.appendChild(txtElement);
            }
        })
        infoContainer.appendChild(addressContainer);
        detailFormElement.appendChild(infoContainer);

        const canvasContainer = document.createElement("DIV");
        canvasContainer.classList.add("canvas-container");

        const canvas = document.createElement("CANVAS");
        canvas.setAttribute("HEIGHT", 400);
        canvas.setAttribute("WIDTH", 400);
        const ctx= canvas.getContext('2d');

        const myCanvas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: model.months,
                datasets: [{ label: 'Number of declarations',
                             data: model.volumes,
                    backgroundColor: [
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)',

                        'rgba(75, 192, 192, 0.2)',

                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',

                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        canvasContainer.appendChild(canvas);
        detailFormElement.appendChild(canvasContainer);
    }


    if (rootElement.firstChild) {
        rootElement.firstChild.replaceWith(divElement);
    } else {
        rootElement.appendChild(divElement);
    }
};



