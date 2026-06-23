const handleAction = async (endpoint) => {
    if (!files || files.length === 0) return alert("Please select files first!");
    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        body: formData, // Ab sirf files bhej rahe hain
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
