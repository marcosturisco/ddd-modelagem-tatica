import EventInterface from "../../@shared/event/event.interface";
import Address from "../value-object/address";

export default class AddressChangedEvent implements EventInterface {
    dataTimeOccurred: Date;
    eventData: any;

    constructor(eventData: any) {
        this.dataTimeOccurred = new Date();
        this.eventData = eventData;
    }
}
