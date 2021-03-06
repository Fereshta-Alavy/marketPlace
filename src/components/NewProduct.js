import React, { useState, useEffect } from "react";
import { PhotoPicker } from "aws-amplify-react";
import { Auth, Storage, API, graphqlOperation } from "aws-amplify";
import { createProduct } from "../graphql/mutations";
import { convertDollarToCents, formatOrderDate } from "../utils";
import PickUpPlace from "./PickUpPlace";
import { useHistory } from "react-router-dom";

// prettier-ignore
import { Form, Button, Input,  Progress} from "element-react";
import { Link } from "react-router-dom";
import aws_exports from "../aws-exports";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import {
  DateTimePicker,
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",

    background: "white"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 230
  }
}));

function NewProduct({ marketId, user }) {
  const history = useHistory();
  const classes = useStyles();
  const [description, setDescription] = useState("");
  // const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ImagePreview, setImagePreview] = useState("");
  const [image, setImage] = useState("");
  const [percentUpload, setPercentUploaded] = useState(0);
  const [pickUpTime, setPickUpTime] = useState(Date);
  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null
  });
  const [address, setAddress] = useState("");
  console.log(pickUpTime);

  async function handleAddProduct() {
    try {
      setIsUploading(true);
      const visibility = "public";
      const { identityId } = await Auth.currentCredentials();
      const filename = `${identityId}/${Date.now()}-${image.name}`;
      const uploadedFile = await Storage.put(filename, image.file, {
        contentType: image.type,
        progressCallback: progress => {
          const percentUpload = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setPercentUploaded(percentUpload);
        }
      });

      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region
      };

      const input = {
        productMarketId: marketId,
        owner: user.attributes.sub,
        description: description,
        shipped: shipped,
        pickUpAddress: address,
        pickUpTime: pickUpTime,
        productPickedUp: false,
        lat: coordinates.lat,
        lng: coordinates.lng,
        // price: convertDollarToCents(price),
        file
      };

      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      );

      setDescription("");
      // setPrice("");
      setShipped(false);
      setImagePreview("");
      setImage("");
      setIsUploading(false);

      setPercentUploaded(0);
      history.goBack();
    } catch (err) {
      console.error("error adding product", err);
    }
  }

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item className="link-2" label="Add Description">
            <Input
              type="text"
              icon="information"
              placeholder="description"
              value={description}
              onChange={description => setDescription(description)}
            />
          </Form.Item>
          {/* <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              placeholder="price"
              value={price}
              onChange={price => setPrice(price)}
            />
          </Form.Item> */}
          <Form.Item
            className="link-2"
            label="Choose PickUp Place By Searching For a Public Around You!"
          >
            <div className="text-center">
              <PickUpPlace
                setCoordinates={setCoordinates}
                setAddress={setAddress}
                address={address}
              />

              {/* <Radio
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
              </Radio> */}
            </div>
          </Form.Item>
          <div className={classes.container}>
            <form className={classes.container} noValidate>
              <TextField
                id="datetime-local"
                label="Select DropOff Date/Time"
                type="datetime-local"
                onChange={event => setPickUpTime(event.target.value)}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </form>
          </div>

          {ImagePreview && (
            <img className="image-preview" src={ImagePreview} alt=""></img>
          )}
          {percentUpload > 0 && (
            <Progress
              type="circle"
              className="progress"
              percentage={percentUpload}
            />
          )}
          <PhotoPicker
            title="product image"
            preview="hidden"
            onLoad={url => setImagePreview(url)}
            onPick={file => setImage(file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: "0.8em"
              },
              formSection: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              },
              sectionHeader: {
                padding: "0.2em",
                color: "var(--darkAmazonOrange)"
              },
              sectionBody: {
                margin: 0,
                width: "250px"
              }
              // photoPickerButton: {
              //   display: "none"
              // }
            }}
          />
          <Form.Item>
            <Button
              disabled={
                !description ||
                !image ||
                isUploading ||
                !pickUpTime ||
                !PickUpPlace
              }
              type="primary"
              onClick={handleAddProduct}
              loading={isUploading}
            >
              {isUploading ? "...Uploading" : "Add Product"}
            </Button>
          </Form.Item>
          <Form.Item>
            <Link className="link-2" to="/">
              Back To Markets List
            </Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default NewProduct;
