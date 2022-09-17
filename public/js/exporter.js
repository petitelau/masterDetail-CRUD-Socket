import {Attribute, LABEL, ID_OBJ} from "./presentationModel/presentationModel.js";
import {formProjector, listItemProjector} from "./exporterProjector.js";


export {Exporter, NoExporter, MasterView, DetailView}

const ATTRIBUTE_NAMES = ['name' ];
const ATTRIBUTE_READONLY = [ 'source', 'since'];
const ATTRIBUTE_ADDRESS= [ 'street', 'city', 'zip'];

const ALL_ATTRIBUTES = ATTRIBUTE_NAMES.concat(ATTRIBUTE_READONLY)

const Exporter = (exp) => {

    // only set the exporter name, the rest of the attr does not exists yet,
    // when the exporter name is entered they will be fetched
    if (undefined==exp) {
        console.log('no exporter')
        const expoterNameAttr = Attribute('');
        expoterNameAttr.getObs(LABEL).setValue("Exporter Name");
        expoterNameAttr.getObs(ID_OBJ).setValue(Date.now() + '_' + (Math.random()*10).toFixed(0));
        return {
            name: expoterNameAttr
        }
    }
    const expoterNameAttr = Attribute(exp.name);
    expoterNameAttr.getObs(LABEL).setValue("Exporter Name");
    expoterNameAttr.getObs(ID_OBJ).setValue(exp.id)

    const attrs=[];
    const adrs = [];
    const months = [];
    const volumes = [];
    for ( const[k,v] of Object.entries(exp)) {
        if (ATTRIBUTE_READONLY.includes(k)) {
            const propAttr = Attribute(exp[k])
            propAttr.getObs(LABEL).setValue(k.toUpperCase());
            attrs[ATTRIBUTE_READONLY.findIndex(el=> el == k)] = propAttr;
        }
        if (k==='address') {
            for ( const[k,v] of Object.entries(exp.address)) {
                if (ATTRIBUTE_ADDRESS.includes(k)) {
                    const propAttr = Attribute(exp.address[k])
                    propAttr.getObs(LABEL).setValue(k.toUpperCase());
                    propAttr.setConverter( input => input.toUpperCase() );
                    adrs[ATTRIBUTE_ADDRESS.findIndex(el=> el == k)] = propAttr;
                }
            }
        }
        if (k==='numOfDeclarations') {
            for ( const[k,v] of Object.entries(exp.numOfDeclarations)) {
                    months.push(k);
                    volumes.push(exp.numOfDeclarations[k]);
            }
        }
    }

    return {
        name: expoterNameAttr,
        source: attrs[0],
        since:  attrs[1],
        street: adrs[0],
        city: adrs[1],
        zip: adrs[2],
        months, volumes
    }
}

const NoExporter = (() => { // one time creation, singleton
    const none = Exporter();
    return none;
})();

const MasterView = (listController, selectionController, rootElement) => {

    const render = exporter =>
        listItemProjector(listController, selectionController, rootElement, exporter, ATTRIBUTE_NAMES);

    // binding
    listController.onModelAdd(render);
};


const DetailView = (selectionController, rootElement) => {

    const render = exporter =>
        formProjector(selectionController, rootElement, exporter, ALL_ATTRIBUTES, ATTRIBUTE_ADDRESS);

    selectionController.onModelSelected(render);
};