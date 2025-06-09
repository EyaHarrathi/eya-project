import React, { useRef } from "react";

const ProfilePhotoUpload = ({ photo, onPhotoChange, onPhotoRemove }) => {
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Directly pass the File object to parent
      onPhotoChange(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onPhotoRemove();
  };

  return (
    <div className="d-flex flex-column align-items-center mb-2 position-relative">
      <img
        src={photo || "../images/profil.png"}
        alt="profile"
        className="rounded-circle cursor-pointer"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          border: "2px solid #dee2e6",
        }}
        onClick={handleImageClick}
      />

      {photo && (
        <button
          type="button"
          className="btn btn-danger btn-sm position-absolute"
          style={{ bottom: "0", right: "25%" }}
          onClick={handleRemove}
          aria-label="Remove photo"
        >
          ×
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="d-none"
        aria-label="Upload profile photo"
      />

      <small className="text-muted mt-2">
        Cliquez pour {photo ? "changer" : "ajouter"} votre photo de profil
      </small>
    </div>
  );
};

export default ProfilePhotoUpload;
