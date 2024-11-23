using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class APIManager : MonoBehaviour
{
    private string serverUrl = "http://127.0.0.1:5000/register";

    public InputField nameField;
    public InputField ageField;
    public InputField locationField;
    public Text messageText;

    public void OnAddUserButtonClick()
    {
        string name = nameField.text;
        int age;
        if (!int.TryParse(ageField.text, out age))
        {
            ShowMessage("Age must be a number!");
            return;
        }
        string location = locationField.text;

        StartCoroutine(AddUser(name, age, location));
    }

    private IEnumerator AddUser(string name, int age, string location)
    {
        // Создание JSON-объекта
        var json = JsonUtility.ToJson(new UserData { name = name, age = age, location = location });
        var request = new UnityWebRequest($"{serverUrl}/add_user", "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            ShowMessage("User added: " + request.downloadHandler.text);
        }
        else
        {
            ShowMessage("Error: " + request.error);
        }
    }

    private void ShowMessage(string message)
    {
        messageText.text = message;
    }
}

[System.Serializable]
public class UserData
{
    public string name;
    public int age;
    public string location;
}