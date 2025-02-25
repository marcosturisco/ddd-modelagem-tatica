import Address from "../value-object/address";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import EnviaConsoleLog1Handler from "../../customer/event/handler/print-log-when-customer-is-created.handler01";
import EnviaConsoleLog2Handler from "../../customer/event/handler/print-log-when-customer-is-created.handler02";
import CustomerCreatedEvent from "../event/customer-created.event";
import AddressChangedEvent from "../event/address-changed.event";
import EnviaConsoleLogHandler from "../event/handler/print-log-when-address-is-changed.handler";

export default class Customer {
  private _id: string;
  private _name: string = "";
  private _address!: Address;
  private _active: boolean = false;
  private _rewardPoints: number = 0;
  private _eventDispatcher = new EventDispatcher();

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
    this.prepareCustomerEvent();
    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get rewardPoints(): number {
    return this._rewardPoints;
  }

  validate() {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._name.length === 0) {
      throw new Error("Name is required");
    }
    //this._eventDispatcher.notify(new CustomerCreatedEvent({ name: "Customer Event" }));
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  get Address(): Address {
    return this._address;
  }

  changeAddress(address: Address) {
    this._address = address;
    const addressChangedEvent = new AddressChangedEvent({
      id: this._id,
      name: this._name,
      address: this._address
    });
    this._eventDispatcher.notify(addressChangedEvent);
  }

  isActive(): boolean {
    return this._active;
  }

  activate() {
    if (this._address === undefined) {
      throw new Error("Address is mandatory to activate a customer");
    }
    this._active = true;
  }

  deactivate() {
    this._active = false;
  }

  addRewardPoints(points: number) {
    this._rewardPoints += points;
  }

  set Address(address: Address) {
    this._address = address;
  }

  // Registering the customer events
  private prepareCustomerEvent() {
    const eventHandlerAddress = new EnviaConsoleLogHandler();
    const eventHandlerFirst = new EnviaConsoleLog1Handler();
    const eventHandlerSecond = new EnviaConsoleLog2Handler();

    this._eventDispatcher.register("AddressChangedEvent", eventHandlerAddress);
    this._eventDispatcher.register("CustomerCreatedEvent", eventHandlerFirst);
    this._eventDispatcher.register("CustomerCreatedEvent", eventHandlerSecond);
  }
}
