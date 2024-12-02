import { useAuth } from "@/components/AuthContext";
import { isFileAllowed } from "@/lib/checkFile";
import { UserType } from "@/lib/types";
import {
  CHANGE_BACKGROUND_PICTURE,
  CHANGE_PROFILE_PICTURE,
  UPDATE_PROFILE_MUTATION,
} from "@/queries/user";
import { useMutation } from "@apollo/client";
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  user: UserType;
}

const EditProfile = ({ user }: Props) => {
  const { refetchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    null,
  );

  const [firstName, setFirstName] = useState<string>(user.firstName || "");
  const [lastName, setLastName] = useState<string>(user.lastName || "");
  const [biography, setBiography] = useState<string>(user.biography || "");

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastButtonRef = useRef<HTMLButtonElement>(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const [changeProfilePicture, { error: profileError }] = useMutation(
    CHANGE_PROFILE_PICTURE,
  );
  const [changeBackgroundPicture, { error: backgroundError }] = useMutation(
    CHANGE_BACKGROUND_PICTURE,
  );

  const [updateProfile, { error: updateProfileError }] = useMutation(
    UPDATE_PROFILE_MUTATION,
  );

  useEffect(() => {
    if (profileFile) {
      const objectUrl = URL.createObjectURL(profileFile);
      setProfilePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setProfilePreview(null);
  }, [profileFile]);

  useEffect(() => {
    if (backgroundFile) {
      const objectUrl = URL.createObjectURL(backgroundFile);
      setBackgroundPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setBackgroundPreview(null);
  }, [backgroundFile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      firstInputRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promises = [];

    if (profileFile) {
      if (!isFileAllowed(profileFile)) return;

      promises.push(changeProfilePicture({ variables: { file: profileFile } }));
    }

    if (backgroundFile) {
      if (!isFileAllowed(backgroundFile)) return;

      promises.push(
        changeBackgroundPicture({ variables: { file: backgroundFile } }),
      );
    }

    const updatedFields: {
      firstName?: string;
      lastName?: string;
      biography?: string;
    } = {};

    if (firstName !== user.firstName) {
      updatedFields.firstName = firstName;
    }

    if (lastName !== user.lastName) {
      updatedFields.lastName = lastName;
    }

    if (biography !== user.biography) {
      updatedFields.biography = biography;
    }

    if (Object.keys(updatedFields).length > 0) {
      promises.push(updateProfile({ variables: updatedFields }));
    }

    try {
      await Promise.all(promises);
      toast.success("Profile updated successfully!");
      setIsOpen(false);
      refetchUser();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile.");
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await changeProfilePicture({ variables: { file: null } });
      toast.success("Profile picture deleted!");
      setIsOpen(false);
      refetchUser();
    } catch (err) {
      console.error("Error deleting profile picture:", err);
      toast.error("Failed to delete profile picture.");
    }
  };

  const handleDeleteBackground = async () => {
    try {
      await changeBackgroundPicture({ variables: { file: null } });
      toast.success("Background picture deleted!");
      setIsOpen(false);
      refetchUser();
    } catch (err) {
      console.error("Error deleting background picture:", err);
      toast.error("Failed to delete background picture.");
    }
  };

  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement>;
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="transform rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-2 text-sm text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 sm:px-4 sm:text-base"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              ref={modalRef}
              className="inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
              onKeyDown={handleTabKey}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                <h3
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  id="modal-headline"
                >
                  Edit Profile
                </h3>
                <div className="mt-2">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex w-full justify-start gap-4">
                      <div className="w-full">
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          First Name
                        </label>
                        <input
                          ref={firstInputRef}
                          type="text"
                          id="first-name"
                          value={firstName}
                          maxLength={20}
                          placeholder="What's your first name?"
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-400 bg-slate-100 p-1 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
                        />
                      </div>
                      <div className="w-full">
                        <label
                          htmlFor="last-name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="last-name"
                          value={lastName}
                          maxLength={20}
                          placeholder="What's your last name?"
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-400 bg-slate-100 p-1 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="">
                      <label
                        htmlFor="biography"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Biography
                      </label>
                      <textarea
                        id="biography"
                        value={biography}
                        placeholder="Tell us about yourself..."
                        onChange={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                          setBiography(e.target.value);
                        }}
                        maxLength={160}
                        className="mt-1 block w-full resize-none overflow-hidden rounded-md border border-gray-400 bg-slate-100 p-1 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-picture"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Profile Picture
                      </label>
                      <div className="mt-1 flex items-center">
                        {profilePreview || user.profilePicture ? (
                          <div className="relative">
                            <img
                              src={
                                profilePreview ||
                                `${BACKEND_URL}${user.profilePicture}`
                              }
                              alt="Profile"
                              width={100}
                              height={100}
                              className="aspect-square rounded-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleDeleteProfile}
                              className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                              <XIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-center dark:bg-gray-600">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              No profile picture
                            </p>
                          </div>
                        )}
                        <label
                          htmlFor="profile-image-upload"
                          className="ml-5 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Change
                        </label>
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              if (!isFileAllowed(e.target.files[0])) return;
                              setProfileFile(e.target.files[0]);
                            }
                          }}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="background-picture"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Background Picture
                      </label>
                      <div className="mt-1 flex items-center">
                        {backgroundPreview || user.backgroundPicture ? (
                          <div className="relative">
                            <img
                              src={
                                backgroundPreview ||
                                `${BACKEND_URL}${user.backgroundPicture}`
                              }
                              alt="Background"
                              width={200}
                              height={100}
                              className="rounded-md object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleDeleteBackground}
                              className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                              <XIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-24 w-48 items-center justify-center rounded-md bg-gray-200 text-center dark:bg-gray-600">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              No background picture
                            </p>
                          </div>
                        )}
                        <label
                          htmlFor="background-image-upload"
                          className="ml-5 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Change
                        </label>
                        <input
                          id="background-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              if (!isFileAllowed(e.target.files[0])) return;
                              setBackgroundFile(e.target.files[0]);
                            }
                          }}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 sm:col-start-2 sm:text-sm"
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        ref={lastButtonRef}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    {(profileError ||
                      backgroundError ||
                      updateProfileError) && (
                      <p className="mt-4 text-red-500">
                        Error:{" "}
                        {profileError?.message ||
                          backgroundError?.message ||
                          updateProfileError?.message}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
