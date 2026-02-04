import React, { ChangeEvent, ChangeEventHandler, useState } from "react";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import upload from "../../lib/upload";
import { useUserStore } from "../../lib/userStore";

interface avatarInterface {
  file: File | null;
  url: string | null;
}

function Login() {
  const [avatar, setAvatar] = useState<avatarInterface>({
    file: null,
    url: "",
  });

  const { currentUser, updateUserStatus } = useUserStore();

  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const handleAvatar: ChangeEventHandler = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoginLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const { email, password } = Object.fromEntries(formData);

    let loginEmail = email as string;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(loginEmail)) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", loginEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        loginEmail = userDoc.data().email;
      } else {
        toast.warn("Please enter a valid email or username");
        setLoginLoading(false);
        return;
      }
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        loginEmail as string,
        password as string
      );
      toast.success("You have successfully Logged in");
      updateUserStatus(currentUser?.id as string, "Online");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    setRegisterLoading(true);
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(e.target as HTMLFormElement);

    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password)
      return toast.warn("Please enter inputs!");
    if (!avatar.file) {
      setRegisterLoading(false);
      return toast.warn("Please upload an avatar!");
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Select another username");
    }

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email as string,
        password as string
      );

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        about: "Hey! I'm on HiveChat",
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("Account has been created! You have been logged in now!");

      form.reset();

      setAvatar({ file: null, url: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="login w-full h-full flex justify-around items-center">
      <div className="item flex-1 flex flex-col items-center gap-5">
        <h2 className="font-bold text-2xl text-fg">Welcome back</h2>
        <form
          className="flex flex-col items-center justify-center gap-5"
          action=""
          onSubmit={handleLogin}
        >
          <input
            className="px-8 py-3 border border-border outline-none bg-surface-overlay text-fg"
            placeholder="Email or Username"
            name="email"
          />
          <input
            className="px-8 py-3 border border-border outline-none bg-surface-overlay text-fg"
            type="password"
            placeholder="Password"
            name="password"
          />
          <button
            disabled={loginLoading}
            className="px-8 py-2 border-none bg-accent text-fg cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loginLoading ? "Loading" : "Login"}
          </button>
        </form>
      </div>
      <div className="seperator h-[80%] w-[1px] bg-border"></div>
      <div className="item flex-1 flex flex-col items-center gap-5">
        <h2 className="font-bold text-2xl text-fg">Create an account</h2>
        <form
          onSubmit={handleRegister}
          className="flex flex-col items-center justify-center gap-5"
          action=""
        >
          <label
            className="w-full flex items-center justify-evenly cursor-pointer underline text-fg-muted"
            htmlFor="file"
          >
            <img
              src={avatar.url || "./avatar.png"}
              alt=""
              className="w-[50px] h-[50px] object-cover opacity-60"
            />
            Upload an image
          </label>
          <input
            className="hidden"
            type="file"
            id="file"
            onChange={handleAvatar}
          />
          <input
            className="px-8 py-3 border border-border outline-none bg-surface-overlay text-fg"
            type="text"
            placeholder="Username"
            name="username"
          />
          <input
            className="px-8 py-3 border border-border outline-none bg-surface-overlay text-fg"
            type="email"
            placeholder="Email"
            name="email"
          />
          <input
            className="px-8 py-3 border border-border outline-none bg-surface-overlay text-fg"
            type="password"
            placeholder="Password"
            name="password"
          />
          <button
            disabled={registerLoading}
            className="px-8 py-2 border-none bg-accent text-fg cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {registerLoading ? "Loading" : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
