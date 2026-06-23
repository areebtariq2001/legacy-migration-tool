const handleAction = async (endpoint) => {
    if (!files || files.length === 0) return alert("Please select files first!");
    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    
    // YEH LINE ZAROORI HAI: Backend in fields ko dhund raha hai
    formData.append(endpoint === "migrate" ? "target_lang" : "language", "python");

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Server error: " + response.status);
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };
