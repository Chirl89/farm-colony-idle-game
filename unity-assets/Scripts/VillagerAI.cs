using UnityEngine;
using UnityEngine.AI;

/// <summary>
/// Controla la Inteligencia Artificial del aldeano de forma autónoma.
/// El aldeano busca recursos, camina hacia ellos usando NavMesh, los recolecta y los lleva al almacén más cercano.
/// Requiere un componente NavMeshAgent en el GameObject.
/// </summary>
[RequireComponent(typeof(NavMeshAgent))]
public class VillagerAI : MonoBehaviour
{
    public enum VillagerState
    {
        Idle,
        WalkingToResource,
        Gathering,
        WalkingToStockpile
    }

    [Header("Atributos del Aldeano (Igual que en el Idle)")]
    public string villagerName = "Aldric";
    public int woodcuttingLevel = 3;
    public int miningLevel = 3;
    public int cookingLevel = 3;

    [Header("Configuración del Trabajo")]
    [Tooltip("El tipo de recurso en el que se especializa este aldeano (Wood, Stone, Berries).")]
    public ResourceNode.NodeType assignedJob = ResourceNode.NodeType.Wood;
    
    [Header("Estado de la IA")]
    public VillagerState currentState = VillagerState.Idle;
    public float gatherInterval = 1.5f; // Tiempo en segundos entre cada golpe
    private float gatherTimer = 0f;

    [Header("Capacidad de Carga")]
    public int carryCapacity = 5;
    private int currentCarriedAmount = 0;

    [Header("Referencias")]
    private NavMeshAgent agent;
    private ResourceNode targetNode;
    private Transform stockpileTarget;
    private PlayerInventory globalInventory;

    void Start()
    {
        agent = GetComponent<NavMeshAgent>();
        
        // Encontrar el inventario global en la escena
        globalInventory = FindObjectOfType<PlayerInventory>();
        if (globalInventory == null)
        {
            Debug.LogError("No se encontró ningún PlayerInventory en la escena. Asegúrate de tener uno.");
        }
    }

    void Update()
    {
        // Máquina de estados básica
        switch (currentState)
        {
            case VillagerState.Idle:
                FindClosestResourceNode();
                break;

            case VillagerState.WalkingToResource:
                if (targetNode == null)
                {
                    currentState = VillagerState.Idle;
                    return;
                }

                // Indicar al NavMeshAgent el destino
                agent.SetDestination(targetNode.transform.position);

                // Comprobar si hemos llegado (distancia de parada configurada en el NavMeshAgent)
                if (!agent.pathPending && agent.remainingDistance <= agent.stoppingDistance)
                {
                    currentState = VillagerState.Gathering;
                    gatherTimer = 0f;
                }
                break;

            case VillagerState.Gathering:
                if (targetNode == null)
                {
                    // Si otro aldeano agotó el recurso mientras recolectábamos
                    currentState = VillagerState.WalkingToStockpile;
                    return;
                }

                gatherTimer += Time.deltaTime;
                
                // Golpeamos el recurso a intervalos regulares
                if (gatherTimer >= gatherInterval)
                {
                    gatherTimer = 0f;

                    // El poder de recolección escala según el atributo del aldeano
                    int gatherPower = GetGatherPower();
                    
                    // Nota: En la versión 3D con NavMesh, el aldeano golpea el recurso directamente.
                    // Para simplificar, acumulamos el recurso internamente y cuando se llena el saco, lo transportamos.
                    currentCarriedAmount++;
                    Debug.Log($"{villagerName} recolectando. Mochila: {currentCarriedAmount}/{carryCapacity}");

                    // Animación de impacto en el recurso
                    targetNode.Gather(gatherPower, null);

                    if (currentCarriedAmount >= carryCapacity)
                    {
                        currentState = VillagerState.WalkingToStockpile;
                    }
                }
                break;

            case VillagerState.WalkingToStockpile:
                if (stockpileTarget == null)
                {
                    FindClosestStockpile();
                }

                if (stockpileTarget != null)
                {
                    agent.SetDestination(stockpileTarget.position);

                    if (!agent.pathPending && agent.remainingDistance <= agent.stoppingDistance)
                    {
                        DeliverResources();
                    }
                }
                else
                {
                    Debug.LogWarning($"{villagerName} no encuentra ningún almacén o Ayuntamiento.");
                    currentState = VillagerState.Idle;
                }
                break;
        }
    }

    /// <summary>
    /// Calcula el poder de recolección según el nivel del atributo, idéntico a getAttributeMult del juego HTML.
    /// </summary>
    private int GetGatherPower()
    {
        // En C# devolvemos entero, pero podemos escalar la velocidad o la cantidad.
        // Nivel 3 es el base (1 golpe). Niveles más altos pueden dar golpes críticos.
        int level = assignedJob == ResourceNode.NodeType.Wood ? woodcuttingLevel : miningLevel;
        
        // Simulación de multiplicador (ej: nivel 6 hace el doble de daño a la roca/árbol)
        return level >= 6 ? 2 : 1;
    }

    private void FindClosestResourceNode()
    {
        // Buscamos todos los nodos de recursos en el mapa
        ResourceNode[] allNodes = FindObjectsOfType<ResourceNode>();
        float closestDistance = Mathf.Infinity;
        ResourceNode closestNode = null;

        foreach (ResourceNode node in allNodes)
        {
            if (node.nodeType == assignedJob)
            {
                float dist = Vector3.Distance(transform.position, node.transform.position);
                if (dist < closestDistance)
                {
                    closestDistance = dist;
                    closestNode = node;
                }
            }
        }

        if (closestNode != null)
        {
            targetNode = closestNode;
            currentState = VillagerState.WalkingToResource;
        }
        else
        {
            // Si no hay recursos, se queda parado
            currentState = VillagerState.Idle;
        }
    }

    private void FindClosestStockpile()
    {
        // En Unity, puedes etiquetar tus almacenes y el Ayuntamiento con el tag "Stockpile"
        GameObject[] stockpiles = GameObject.FindGameObjectsWithTag("Stockpile");
        
        float closestDistance = Mathf.Infinity;
        Transform closestStockpile = null;

        foreach (GameObject stock in stockpiles)
        {
            float dist = Vector3.Distance(transform.position, stock.transform.position);
            if (dist < closestDistance)
            {
                closestDistance = dist;
                closestStockpile = stock.transform;
            }
        }

        stockpileTarget = closestStockpile;
    }

    private void DeliverResources()
    {
        if (globalInventory != null && currentCarriedAmount > 0)
        {
            string resourceKey = assignedJob == ResourceNode.NodeType.Wood ? "wood" : "stone";
            globalInventory.AddResource(resourceKey, currentCarriedAmount);
        }

        currentCarriedAmount = 0;
        currentState = VillagerState.Idle; // Reiniciar ciclo
        targetNode = null; // Buscar un nodo nuevo (por si el anterior fue talado)
    }
}
