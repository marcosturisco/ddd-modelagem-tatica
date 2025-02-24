import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const newCustomer = new Customer("456", "Customer 2");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");

    customer.changeAddress(address);
    newCustomer.changeAddress(address);

    await customerRepository.create(customer);
    await customerRepository.create(newCustomer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    //Atualizando cliente da ordem
    await OrderModel.update(
      { customer_id: newCustomer.id },
      { where: { id: order.id } }
    );

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "456",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find an order by id", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");

    customer.changeAddress(address);

    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    //Pesquisando ordem por id
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");

    customer.changeAddress(address);

    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product01 = new Product("123", "Product 1", 10);
    const product02 = new Product("456", "Product 2", 10);
    await productRepository.create(product01);
    await productRepository.create(product02);

    const orderItem01 = new OrderItem(
      "1",
      product01.name,
      product01.price,
      product01.id,
      2
    );
    const orderItem02 = new OrderItem(
      "2",
      product02.name,
      product02.price,
      product02.id,
      2
    );

    const order01 = new Order("123", customer.id, [orderItem01]);
    const order02 = new Order("456", customer.id, [orderItem02]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order01);
    await orderRepository.create(order02);

    //Pesquisando todas as ordens
    const ordersModel = await OrderModel.findAll({ include: ["items"] });
    const ordersJSON = ordersModel.map(order => order.toJSON());

    expect(ordersJSON).toStrictEqual([
      {
        id: "123",
        customer_id: "123",
        total: order01.total(),
        items: [
          {
            id: orderItem01.id,
            name: orderItem01.name,
            price: orderItem01.price,
            quantity: orderItem01.quantity,
            order_id: "123",
            product_id: "123",
          },
        ],
      },
      {
        id: "456",
        customer_id: "123",
        total: order02.total(),
        items: [
          {
            id: orderItem02.id,
            name: orderItem02.name,
            price: orderItem02.price,
            quantity: orderItem02.quantity,
            order_id: "456",
            product_id: "456",
          },
        ],
      },
    ]);
  });
});
