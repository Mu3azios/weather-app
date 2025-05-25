<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import blankProfilePicture from "../assets/blankProfilePicture.png";
import "flag-icons/css/flag-icons.min.css";
import "v-phone-input/dist/v-phone-input.css";

import "../components/styles/AccountDetailsStyle.css";
import { useToastStore } from "../../src/stores/toastStore";

export default defineComponent({
  name: "AccountDetails",

  setup() {
    const editMode = ref(false);
    const showPhotoOptions = ref(false);

    const defaultPhoto = blankProfilePicture;
    const toast = useToastStore();
    const userData = ref({
      photo: null,
      name: "",
      email: "",
      phone: "",
    });

    const tempUserData = ref({ ...userData.value });

    const errors = ref({
      name: "",
      email: "",
      phone: "",
    });

    const fileInput = ref<HTMLInputElement | null>(null);
    const router = useRouter();

    onMounted(() => {
      const savedData = localStorage.getItem("userData");
      if (savedData) {
        userData.value = JSON.parse(savedData);
        tempUserData.value = { ...userData.value };
      }
    });

    const triggerFileInput = () => {
      fileInput.value?.click();
    };
    const removeProfilePicture = () => {
      userData.value.photo = null;
      tempUserData.value.photo = null;

      showPhotoOptions.value = false;
      toast.success("Photo Has Been Removed");
    };

    const formatPhoneNumber = () => {

      const raw = tempUserData.value.phone;

      // Extract country code (starting with +)
      const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);

      if (match) {
        const countryCode = match[1];
        const rest = match[2].replace(/\D/g, ""); // Remove non-digits from rest of the number

        let formatted = "";
        for (let i = 0; i < rest.length; i += 3) {
          formatted += rest.slice(i, i + 3);
          if (i + 3 < rest.length) formatted += " - ";
        }

        tempUserData.value.phone = `${countryCode} ${formatted}`;
        errors.value.phone = "";
      } else {

        const digitsOnly = raw.replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < digitsOnly.length; i += 3) {
          formatted += digitsOnly.slice(i, i + 3);
          if (i + 3 < digitsOnly.length) formatted += " - ";
        }

        tempUserData.value.phone = formatted;
        errors.value.phone = "";
      }
    };

    const validateName = () => {
      const name = tempUserData.value.name;
      errors.value.name = "";

      if (!name) {
        errors.value.name = "Name is required.";
        return;
      }

      if (name.length > 20) {
        errors.value.name = "Name must be 20 characters or less.";
        return;
      }

      if (/\d/.test(name)) {
        errors.value.name = "Name cannot contain numbers.";
        return;
      }
    };

    const validateEmail = () => {
      const email = tempUserData.value.email.trim();

      if (!email) {
        errors.value.email = "Email is required.";
        return;
      }


      if (email.indexOf("@") === -1) {
        errors.value.email = "Invalid email format (missing @ symbol)";
        return;
      }


      if (!email.endsWith(".com")) {
        errors.value.email = "Email must end with .com";
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
      if (!emailPattern.test(email)) {
        errors.value.email = "Invalid email format";
        return;
      }

      errors.value.email = "";
    };

    const handleInput = () => {
      validateName();
      validateEmail();
      formatPhoneNumber();

      if (!errors.value.name && !errors.value.email && !errors.value.phone) {
        userData.value = { ...tempUserData.value };
        saveUserData();
      }
    };

    const togglePhotoOptions = () => {
      showPhotoOptions.value = !showPhotoOptions.value;
    };

    const toggleEditMode = () => {
      if (editMode.value) {
        handleInput();
        if (errors.value.name || errors.value.email || errors.value.phone) {
          return;
        }
      } else {
        tempUserData.value = { ...userData.value };
      }
      editMode.value = !editMode.value;
    };

    const handleFileUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          userData.value.photo = e.target?.result;
          tempUserData.value.photo = e.target?.result;

          showPhotoOptions.value = false; // Close the photo options
          toast.success("Photo Updated Successfully");
        };

        reader.readAsDataURL(file); // Read the image and convert it to Base64
      }
    };

    const saveUserData = () => {
      localStorage.setItem("userData", JSON.stringify(userData.value));
      toast.success("Data Saved Successfully");
    };

    const goToHomeView = () => {
      router.push({ name: "home" });
    };

    return {
      userData,
      toast,
      tempUserData,
      editMode,
      errors,
      defaultPhoto,
      showPhotoOptions,
      fileInput,
      formatPhoneNumber,
      validateName,
      validateEmail,
      handleInput,
      toggleEditMode,
      saveUserData,
      togglePhotoOptions,
      handleFileUpload,
      triggerFileInput,
      removeProfilePicture,
      goToHomeView,
    };
  },
});
</script>
<template>
  <section  class="account-details">
    <header class="profile-header">
      <i class="pi pi-arrow-left" @click="goToHomeView"></i>
      <h2>Edit Profile</h2>
      <div></div>
    </header>
    <div class="curved-background"></div>
    <figure  class="profile-image-container">
      <img
        :src="tempUserData.photo ? tempUserData.photo : defaultPhoto"
        alt="User Photo"
        class="profile-image"
      />
      <div  v-if="editMode" class="edit-icon-container" @click="togglePhotoOptions">
        <i class="pi pi-pencil"></i>
      </div>
      <div v-if="showPhotoOptions" class="photo-options">
        <button class="profile-edit-button" @click="triggerFileInput">Upload Photo</button>
        <button
          class="profile-edit-button"
          @click="removeProfilePicture"
          :disabled="!userData.photo"
        >
          Delete Photo
        </button>
        <input type="file" ref="fileInput" @change="handleFileUpload" class="file-input" />
      </div>
    </figure>

    <section  class="user-data-preview">
      <p>{{ userData.name }}</p>
      <div  class="email-with-phone">
        <div class="email">{{ userData.email }}</div>
        <div class="separator">|</div>
        <div class="phone">{{ userData.phone.replace(/-/g, "") }}</div>
      </div>
    </section>

    <div :style="{ padding: '0 10px' }">
      <div class="input-field-container">
        <input
          id="name"
          v-model="tempUserData.name"
          :disabled="!editMode"
          @input="validateName"
          required
        />
        <label for="name">Name</label>
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <div class="input-field-container">
        <input
          id="email"
          v-model="tempUserData.email"
          :disabled="!editMode"
          @input="validateEmail"
          required
        />
        <label for="email">Email</label>
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <div class="input-field-container">
          <vue-tel-input
            id="phone"
            name="phone"
            v-model="tempUserData.phone"
            @input="formatPhoneNumber"
            :disabled="!editMode"
            required
          />
          <label for="phone">phone</label>

        <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
      </div>
    </div>

    <footer class="submit-button-container">
      <button type="submit" @click="toggleEditMode" class="submit-button">
        {{ editMode ? "Submit" : "Edit" }}
      </button>
    </footer>
  </section>
</template>
