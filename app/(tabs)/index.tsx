import { Image, StyleSheet, Platform, Button } from "react-native";
import ImagePicker, {
  getCameraPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  ImagePickerAsset,
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useState } from "react";
import axios from "axios";

export default function HomeScreen() {
  const [photo, setPhoto] = useState<ImagePickerAsset | null>(null);

  const openImagePicker = async () => {
    const permissionCheck = await getMediaLibraryPermissionsAsync();
    const canRequest = permissionCheck.canAskAgain;
    let permissionGranted = permissionCheck.granted;
    if (!permissionGranted) {
      if (canRequest) {
        const response = await requestMediaLibraryPermissionsAsync();
        permissionGranted = response.granted;
      } else {
        return { askToOpenSettings: true, cancelled: true };
      }
    }
    if (permissionGranted) {
      const imagePickerSuccessResult = await launchImageLibraryAsync();
      const assets = imagePickerSuccessResult.assets;
      // since we only support single photo upload for now we will only be focusing on 0'th element.
      const photo = assets && assets[0];
      console.log(photo);
      setPhoto(photo);
    }
  };

  const openCameraPicker = async () => {
    const permissionCheck = await getCameraPermissionsAsync();
    const canRequest = permissionCheck.canAskAgain;
    let permissionGranted = permissionCheck.granted;
    if (!permissionGranted) {
      if (canRequest) {
        const response = await requestCameraPermissionsAsync();
        permissionGranted = response.granted;
      } else {
        return { askToOpenSettings: true, cancelled: true };
      }
    }
    if (permissionGranted) {
      const imagePickerSuccessResult = await launchCameraAsync();
      const assets = imagePickerSuccessResult.assets;
      // since we only support single photo upload for now we will only be focusing on 0'th element.
      const photo = assets && assets[0];
      console.log(photo);
      setPhoto(photo);
    }
  };

  // {"assetId": null, "base64": null, "duration": null, "exif": null,
  // "fileName": "6ff93bdd-ff8c-40b1-9bd9-f8a8a02e65e2.jpeg", "fileSize": 187799, "height": 1280,
  // "mimeType": "image/jpeg", "rotation": null, "type": "image",
  // "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252Fexpo-51-image-upload-bug-80c9d27e-97e1-44c9-ab10-4b8cade47bb5/ImagePicker/5d4d3fc2-5fc3-4a18-a4a3-03c4b1ea992f.jpeg", "width": 960}
  const uploadPhoto = async () => {
    if (photo) {
      const uri = photo.uri;
      const filename =
        photo.fileName || uri.replace(/^(file:\/\/|content:\/\/)/, "");
      const type = photo.mimeType;
      const formData = new FormData();

      formData.append("file", {
        uri,
        name: filename,
        contentType: type,
        type,
      } as any);

      try {
        const response = await axios.postForm(
          `https://chat.stream-io-api.com/channels/messaging/c3840f01-a54c-4563-9bb1-2d220a89d83c/image?user_id=khushalagarwalgetstreamio&connection_id=65e9ec5e-0a09-243b-0000-00000219d991&api_key=v3weqm7meazf`,
          formData,
          {
            headers: {
              "Stream-Auth-Type": "jwt",
              Authorization:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoia2h1c2hhbGFnYXJ3YWxnZXRzdHJlYW1pbyJ9.8Pw06BSDDk1BLiho10CYTvtglUH00rakVhGpkFDt-NE",
            },
          }
        );
        console.log(response);
        if (response) {
          alert("Image Uploaded");
        }
      } catch (err: unknown) {
        console.log(err);
        if (axios.isAxiosError(err)) {
          console.log(err.response?.data);
          alert("Something went wrong");
        }
      } finally {
        setPhoto(null);
      }
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <Button title="Image Picker" onPress={openImagePicker} />
      <Button title="Open Camera Picker" onPress={openCameraPicker} />
      <Button title="Upload Photo" onPress={uploadPhoto} />
      {photo && (
        <Image
          source={{ uri: photo.uri }}
          style={{ width: 200, height: 200 }}
        />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
