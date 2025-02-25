import Order from "../../../../domain/checkout/entity/order";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: { id: entity.id },
      }
    );

    await Promise.all(
      entity.items.map(async (item) => {
        const existingItem = await OrderItemModel.findOne({
          where: { id: item.id, order_id: entity.id },
        });

        if (existingItem) {
          // Atualiza o item se ele já existir
          await OrderItemModel.update(
            {
              name: item.name,
              price: item.price,
              product_id: item.productId,
              quantity: item.quantity,
            },
            {
              where: { id: item.id },
            }
          );
        } else {
          // Cria o item se ele não existir
          await OrderItemModel.create({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
            order_id: entity.id,
          });
        }
      })
    );

    // Removendo itens que não estão mais na lista
    const currentItems = await OrderItemModel.findAll({
      where: { order_id: entity.id },
    });

    for (const currentItem of currentItems) {
      if (!entity.items.some((item) => item.id === currentItem.id)) {
        await OrderItemModel.destroy({ where: { id: currentItem.id } });
      }
    }
  }

  async find(key: string): Promise<Order> {
    const orderData = await OrderModel.findOne({
      where: { id: key },
      include: [{ model: OrderItemModel, as: 'items' }],
    });

    if (!orderData) {
      throw new Error(`Order with id ${key} not found`);
    }

    const items = orderData.items.map((item: any) =>
      new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
    );

    return new Order(orderData.id, orderData.customer_id, items);
  }


  async findAll(): Promise<Order[]> {
    const orderRecords = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });

    return orderRecords.map((orderRecord) =>
      new Order(
        orderRecord.id,
        orderRecord.customer_id,
        orderRecord.items.map((item) =>
          new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          )
        )
      )
    );
  }
}
