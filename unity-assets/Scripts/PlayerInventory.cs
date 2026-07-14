using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gestiona el inventario de recursos del jugador y de la colonia.
/// Proporciona eventos para que la UI se actualice automáticamente cuando cambien los valores.
/// </summary>
public class PlayerInventory : MonoBehaviour
{
    // Diccionario interno que almacena la cantidad de cada recurso.
    // Similar a un diccionario en Python: {"wood": 100, "stone": 50, ...}
    private Dictionary<string, int> resources = new Dictionary<string, int>();

    // Evento que se dispara cada vez que un recurso cambia.
    // Permite que la interfaz de usuario (UI) se entere del cambio sin tener que preguntar cada frame (polling).
    public static event Action<string, int> OnResourceChanged;

    void Awake()
    {
        // Inicializamos los recursos base a 0 para evitar errores de clave no encontrada
        resources["wood"] = 0;
        resources["stone"] = 0;
        resources["gold"] = 100; // El jugador empieza con algo de oro
        resources["food"] = 50;  // Comida básica inicial
    }

    /// <summary>
    /// Devuelve la cantidad de un recurso específico.
    /// </summary>
    public int GetResourceAmount(string resourceType)
    {
        string key = resourceType.ToLower();
        return resources.ContainsKey(key) ? resources[key] : 0;
    }

    /// <summary>
    /// Añade una cantidad de recursos al inventario.
    /// </summary>
    public void AddResource(string resourceType, int amount)
    {
        if (amount <= 0) return;

        string key = resourceType.ToLower();
        if (resources.ContainsKey(key))
        {
            resources[key] += amount;
        }
        else
        {
            resources[key] = amount;
        }

        Debug.Log($"Inventario: {key} +{amount}. Total: {resources[key]}");
        
        // Notificamos a la UI (u otros sistemas) que este recurso ha cambiado
        OnResourceChanged?.Invoke(key, resources[key]);
    }

    /// <summary>
    /// Verifica si hay suficiente cantidad de un recurso y lo consume si es posible.
    /// </summary>
    /// <returns>True si el recurso fue consumido con éxito, False si no había suficiente.</returns>
    public bool ConsumeResource(string resourceType, int amount)
    {
        if (amount <= 0) return true;

        string key = resourceType.ToLower();
        if (resources.ContainsKey(key) && resources[key] >= amount)
        {
            resources[key] -= amount;
            Debug.Log($"Inventario: {key} -{amount}. Total: {resources[key]}");
            
            // Notificamos a la UI
            OnResourceChanged?.Invoke(key, resources[key]);
            return true;
        }

        Debug.LogWarning($"Inventario: No hay suficiente {key}. Requerido: {amount}, Disponible: {GetResourceAmount(key)}");
        return false;
    }

    /// <summary>
    /// Verifica si tiene los recursos para una lista de costes (útil para la construcción).
    /// </summary>
    public bool HasEnoughResources(string resourceType, int amount)
    {
        return GetResourceAmount(resourceType) >= amount;
    }
}
