import { ObservableList, Observable }                       from "./presentationModel/observable.js";
import {ID_OBJ} from "./presentationModel/presentationModel.js";
import {sendUpdateToServerViaSocket} from "./service/fileService.js";


export { ListController, SelectionController }

const ListController = (model,items, socket) => {

    let refresh = false;
    const listModel = ObservableList([]); // observable array of models, this state is private
    const addItems = _ =>
        items.forEach(item=> listModel.add(model(item)));

    const addNewItems = newItems => {
        console.log('addNewItems' ,  newItems)
        if (! newItems ||  newItems.length == 0 ||  Object.keys(newItems).length === 0) return;
        refresh=true;
        listModel.delAll();
        newItems.forEach(item=> listModel.add(model(item)));
        refresh = false;
    }

    const setUpd = new Set();
    const objs = [];

    const saveDirty =  (id,val) => {
        if ( ! val ) return;
        if (! setUpd.has(id) ) {
            setUpd.add(id)
            objs.push({id:id, val:val, flagUpd: false})
        }
        else {
            const idx = objs.findIndex(el=>el.id === id)
            if (idx <0) return
            if (objs[idx].val !== val) {
                objs[idx].flagUpd=true;
                objs[idx].val = val;
            }
        }
    }

    const persist = (socket) => (delItem)=> {
        if (refresh) return;
        if (delItem) {
            const itemToDelete = delItem.name.getObs(ID_OBJ).getValue()
            const idx = objs.findIndex(el=> el.id === itemToDelete )
            console.log(idx);
            objs.splice(idx,1);
            sendUpdateToServerViaSocket(socket,objs);
            return
        }

        const filtered = objs.filter(el=> el.flagUpd )
        if (filtered.length == 0 ) return
        // send the data to the server and update flag
        sendUpdateToServerViaSocket(socket, objs)
        objs.forEach(el=>el.flagUpd=false)
    }


    return {
        addItems:            () => addItems(),
        addNewItems,
        addModel:            () => listModel.add(model()),
        removeModel:         listModel.del,
        onModelAdd:          listModel.onAdd,
        onModelRemove:       listModel.onDel,
        persist:             persist(socket),
        saveDirty,refresh
    }

};

const SelectionController = noSelection => {

    const selectedModelObs = Observable(noSelection);

    return {
        setSelectedModel : selectedModelObs.setValue,
        getSelectedModel : selectedModelObs.getValue,
        onModelSelected:   selectedModelObs.onChange,
        clearSelection:     () => selectedModelObs.setValue(noSelection),
    }
};
