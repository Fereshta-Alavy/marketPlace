import React, { useState, useEffect } from "react";
import { S3Image } from "aws-amplify-react";
import {
  converCentsToDollars,
  formatOrderDate,
  formatProductDate
} from "../utils";
import { UserContext } from "../App";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import { Link } from "react-router-dom";

// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio, Icon } from "element-react";
import PayButton from "./PayButton";
import { color } from "@material-ui/system";

function Product({ product, key, marketId }) {
  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [description, setDescription] = useState("");
  // const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [productStatusDialog, setProductStatusDialog] = useState(false);
  const [pickedUp, setProductPickedUp] = useState(product.productPickedUp);
  const [isProductOwner, setIsProductOwner] = useState(false);
  const [isShown, setIsShown] = useState(false);
  console.log(product);
  useEffect(() => {
    updatePickUp();
  }, [pickedUp]);

  async function updatePickUp() {
    try {
      const input = {
        id: product.id,
        productPickedUp: pickedUp
      };

      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
    } catch (err) {
      console.error(`failed to update product with Id: ${product.id}`, err);
    }
  }
  async function handleUpdateProduct(productId) {
    try {
      setUpdateProductDialog(false);

      const input = {
        id: productId,
        description,
        // price,
        shipped
      };

      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      Notification({
        title: "Success",
        message: "Product Updated Successfully",

        type: "success"
      });
    } catch (err) {
      console.error(`failed to update product with Id: ${product.id}`, err);
    }
  }

  async function handleDeleteProduct(productId) {
    try {
      setDeleteProductDialog(false);
      const input = {
        id: productId
      };
      await API.graphql(graphqlOperation(deleteProduct, { input }));

      Notification({
        title: "Success",
        message: "Product deleted successfully",

        type: "success"
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePickUpProduct(productId) {
    setProductStatusDialog(false);
    setProductPickedUp(true);
  }

  async function handleNoShow(productId) {
    setProductStatusDialog(false);
    setProductPickedUp(false);
  }

  return (
    <UserContext.Consumer>
      {({ user, userAttributes }) => {
        if (user && user.attributes.sub === product.owner) {
          setIsProductOwner(true);
        }
        const isEmailVerified = userAttributes && userAttributes.email_verified;
        return (
          <div className="card-container">
            <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
              <S3Image
                imgKey={product.file.key}
                theme={{ photoImg: { maxWidth: "100%", maxHieght: "100%" } }}
              />

              <div className="card-body">
                <h3 className="m-0">{product.description}</h3>
                <Popover
                  placement="top"
                  width="160px"
                  height="200px"
                  trigger="click"
                  visible={deleteProductDialog}
                  content={
                    <>
                      <p>This is the Map for Pick up place!</p>
                      {deleteProductDialog && (
                        <div>
                          <iframe
                            width="300"
                            height="130"
                            frameborder="0"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDKPt9VC9B2xshNU1z56LpqN4VzuLCT7GU&q=${product.pickUpAddress}`}
                            allowfullscreen
                          ></iframe>
                        </div>
                      )}

                      <div className="text-right">
                        <Button
                          size="mini"
                          type="text"
                          className="m-1"
                          onClick={() => setDeleteProductDialog(false)}
                        >
                          Ok
                        </Button>
                      </div>
                    </>
                  }
                >
                  <div
                    className="text-right"
                    onMouseEnter={() => setIsShown(true)}
                    onMouseLeave={() => setIsShown(false)}
                    onClick={() => setDeleteProductDialog(true)}
                  >
                    {/* <img
                      src="https://img.icons8.com/small/13/000000/worldwide-location.png"
                      alt=""
                      className="icon"
                    /> */}
                    {isShown ? (
                      <h1
                        style={{
                          color: "blue",
                          font: "small-caption",
                          fontSize: 13
                        }}
                      >
                        <h1
                          style={{
                            color: "black",
                            font: "bold",
                            fontSize: 13
                          }}
                        >
                          PickUp Adress:
                        </h1>{" "}
                        {product.pickUpAddress}
                      </h1>
                    ) : (
                      <h1
                        style={{
                          color: "black",
                          font: "small-caption",
                          fontSize: 13
                        }}
                      >
                        <h1
                          style={{
                            color: "black",
                            font: "bold",
                            fontSize: 13
                          }}
                        >
                          PickUp Adress:
                        </h1>{" "}
                        {product.pickUpAddress}
                      </h1>
                    )}
                  </div>
                </Popover>

                <div className="text-right">
                  {" "}
                  <h1
                    style={{
                      color: "black",
                      font: "small-caption",
                      fontSize: 13
                    }}
                  >
                    <h1
                      style={{
                        color: "black",
                        font: "bold",
                        fontSize: 13
                      }}
                    >
                      PickUp Time:
                    </h1>{" "}
                    {formatOrderDate(product.pickUpTime)}
                  </h1>
                  {isEmailVerified ? (
                    !isProductOwner && (
                      <PayButton
                        product={product}
                        userAttributes={userAttributes}
                        marketId={marketId}
                      />
                    )
                  ) : (
                    <Link to="/profile" className="link">
                      Verify email
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            {/* update / delete product buttons */}

            <div className="text-center">
              {isProductOwner && (
                <>
                  <Button
                    type="warning"
                    icon="edit"
                    className="m-1"
                    disabled={pickedUp}
                    onClick={() => {
                      setUpdateProductDialog(true);
                      setDescription(product.description);
                      // setPrice(product.price);
                      setShipped(product.shipped);
                    }}
                  ></Button>
                  <Popover
                    placement="top"
                    width="160px"
                    trigger="click"
                    visible={deleteProductDialog}
                    content={
                      <>
                        <p>Do you want to delete this product</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setDeleteProductDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="mini"
                            type="primary"
                            className="m-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      onClick={() => setDeleteProductDialog(true)}
                      type="danger"
                      icon="delete"
                    ></Button>
                  </Popover>

                  <Popover
                    placement="top"
                    width="160px"
                    trigger="click"
                    visible={productStatusDialog}
                    content={
                      <>
                        <p>Was the product pick up by customer?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setProductStatusDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => handlePickUpProduct(product.id)}
                          >
                            PickedUp
                          </Button>
                          <Button
                            size="mini"
                            type="primary"
                            className="m-1"
                            onClick={() => handleNoShow(product.id)}
                          >
                            NoShow
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      onClick={() => setProductStatusDialog(true)}
                      type="primary"
                      className="m-1"
                      disabled={pickedUp || !product.productOrdered}
                    >
                      {pickedUp ? "Picked Up" : "Item Status"}
                    </Button>
                  </Popover>
                </>
              )}
            </div>
            {/* Update Product Dialog */}
            <Dialog
              title="Update product"
              size="large"
              customClass="dialog"
              visible={updateProductDialog}
              onCancel={() => setUpdateProductDialog(false)}
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Update Description">
                    <Input
                      icon="information"
                      placeholder="Product Description"
                      trim={true}
                      value={description}
                      onChange={description => setDescription(description)}
                    />
                  </Form.Item>

                  {/* <Form.Item label="Update Price">
                    <Input
                      type="number"
                      icon="plus"
                      placeholder="price"
                      value={price}
                      onChange={price => setPrice(price)}
                    />
                  </Form.Item> */}

                  <Form.Item label="Update Shipping">
                    <div className="text-center">
                      <Radio
                        value="true"
                        checked={shipped === true}
                        onChange={() => setShipped(true)}
                      >
                        Shippeed
                      </Radio>
                      <Radio
                        value="false"
                        checked={shipped === false}
                        onChange={() => setShipped(false)}
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => updateProductDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
}

export default Product;
