using UnityEngine;

/// <summary>
/// Representa un recurso físico en el mapa (como un árbol, una roca o un arbusto).
/// El jugador o los aldeanos pueden recolectarlo golpeándolo.
/// </summary>
public class ResourceNode : MonoBehaviour
{
    public enum NodeType
    {
        Wood,
        Stone,
        Berries
    }

    [Header("Configuración del Recurso")]
    public NodeType nodeType = NodeType.Wood;
    [Tooltip("Cantidad total de recursos que contiene este nodo antes de agotarse.")]
    public int maxResources = 10;
    private int currentResources;

    [Tooltip("Cantidad de golpes requeridos para extraer una unidad de recurso.")]
    public int hitsPerExtraction = 3;
    private int currentHits = 0;

    [Tooltip("Prefab del objeto físico que salta cuando se golpea el recurso (ej: astillas, polvo de piedra).")]
    public GameObject hitEffectPrefab;
    [Tooltip("Prefab del recurso que cae al suelo (ej: tronquito o piedra) si queremos recolección física.")]
    public GameObject dropPrefab;

    void Start()
    {
        currentResources = maxResources;
    }

    /// <summary>
    /// Intenta extraer recursos de este nodo.
    /// </summary>
    /// <param name="gatherPower">Poder de extracción del recolector (herramientas mejores = mayor daño/poder).</param>
    /// <param name="collectorInventory">El inventario donde se guardarán los recursos.</param>
    public void Gather(int gatherPower, PlayerInventory collectorInventory)
    {
        if (currentResources <= 0) return;

        currentHits += gatherPower;
        
        // Reproducir efecto visual de impacto
        if (hitEffectPrefab != null)
        {
            Instantiate(hitEffectPrefab, transform.position + Vector3.up * 0.5f, Quaternion.identity);
        }

        // Si alcanzamos los golpes necesarios, extraemos un recurso
        if (currentHits >= hitsPerExtraction)
        {
            currentHits = 0;
            currentResources--;

            string resourceKey = GetResourceKey();

            if (dropPrefab != null)
            {
                // Instanciar el ítem en el suelo para que el jugador lo recoja físicamente
                GameObject droppedItem = Instantiate(dropPrefab, transform.position + Vector3.up * 0.5f, Quaternion.identity);
                // Le aplicamos una pequeña fuerza física aleatoria para que "salte" del árbol/roca
                Rigidbody rb = droppedItem.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    Vector3 force = new Vector3(Random.Range(-1.5f, 1.5f), 3f, Random.Range(-1.5f, 1.5f));
                    rb.AddForce(force, ForceMode.Impulse);
                }
            }
            else
            {
                // Si no hay drop prefab, lo añadimos directamente al inventario (estilo clásico)
                if (collectorInventory != null)
                {
                    collectorInventory.AddResource(resourceKey, 1);
                }
            }

            // Si el recurso se agota, destruimos o desactivamos el nodo
            if (currentResources <= 0)
            {
                OnNodeDepleted();
            }
        }
    }

    private string GetResourceKey()
    {
        switch (nodeType)
        {
            case NodeType.Wood: return "wood";
            case NodeType.Stone: return "stone";
            case NodeType.Berries: return "berries";
            default: return "wood";
        }
    }

    private void OnNodeDepleted()
    {
        Debug.Log($"{gameObject.name} se ha agotado por completo.");
        
        // Aquí podrías cambiar el sprite por un tocón de árbol o una roca rota
        // Por ahora, simplemente destruimos el objeto
        Destroy(gameObject);
    }
}
