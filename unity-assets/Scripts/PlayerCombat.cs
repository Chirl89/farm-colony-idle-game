using System.Collections;
using UnityEngine;

/// <summary>
/// Controla las acciones de combate del jugador: Ataque básico, Bloqueo y Dash (esquiva).
/// Diseñado para botones de acción J (Ataque), K (Bloqueo) y L (Dash) o equivalentes en mando/ratón.
/// </summary>
public class PlayerCombat : MonoBehaviour
{
    [Header("Ataque Básico")]
    [Tooltip("El punto desde donde se proyecta el golpe (objeto vacío al frente del jugador).")]
    public Transform attackPoint;
    [Tooltip("Radio del área de ataque.")]
    public float attackRange = 1.2f;
    [Tooltip("Capa de física donde están los enemigos (ej: 'Enemy').")]
    public LayerMask enemyLayers;
    public int attackDamage = 10;
    public float attackCooldown = 0.5f;
    private float nextAttackTime = 0f;

    [Header("Bloqueo con Escudo")]
    public bool isBlocking = false;
    [Range(0f, 1f)]
    [Tooltip("Multiplicador de velocidad de movimiento al bloquear (por defecto se mueve a un 30% de su velocidad).")]
    public float blockSpeedMultiplier = 0.3f;

    [Header("Dash (Esquiva)")]
    public float dashSpeed = 15f;
    public float dashDuration = 0.2f;
    public float dashCooldown = 1.0f;
    [HideInInspector]
    public bool isDashing = false;
    private float nextDashTime = 0f;

    private PlayerController playerController;
    private CharacterController charController;
    private float baseSpeed;

    void Start()
    {
        playerController = GetComponent<PlayerController>();
        charController = GetComponent<CharacterController>();
        
        if (playerController != null)
        {
            baseSpeed = playerController.moveSpeed;
        }
    }

    void Update()
    {
        // Si estamos esquivando, no podemos hacer ninguna otra acción
        if (isDashing) return;

        // 1. ATAQUE BÁSICO (Click izquierdo o Tecla J)
        if (Time.time >= nextAttackTime && (Input.GetButtonDown("Fire1") || Input.GetKeyDown(KeyCode.J)) && !isBlocking)
        {
            Attack();
            nextAttackTime = Time.time + attackCooldown;
        }

        // 2. BLOQUEO (Mantener Click derecho o Tecla K)
        if (Input.GetButtonDown("Fire2") || Input.GetKeyDown(KeyCode.K))
        {
            StartBlocking();
        }
        if (Input.GetButtonUp("Fire2") || Input.GetKeyUp(KeyCode.K))
        {
            StopBlocking();
        }

        // 3. DASH / ESQUIVA (Barra espaciadora o Tecla L)
        if (Time.time >= nextDashTime && (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.L)) && !isBlocking)
        {
            StartCoroutine(PerformDash());
            nextDashTime = Time.time + dashCooldown;
        }
    }

    private void Attack()
    {
        Debug.Log("¡Ataque!");

        if (attackPoint == null)
        {
            Debug.LogWarning("Por favor, asigna un 'Attack Point' (objeto hijo) en el Inspector.");
            return;
        }

        // Detecta todos los colisionadores de enemigos en el radio de ataque
        Collider[] hitEnemies = Physics.OverlapSphere(attackPoint.position, attackRange, enemyLayers);

        foreach (Collider enemy in hitEnemies)
        {
            Debug.Log("Golpeado: " + enemy.name);
            
            // Simulación: Buscamos un script de salud en el enemigo
            // Por ejemplo: enemy.GetComponent<EnemyHealth>()?.TakeDamage(attackDamage);
        }
    }

    private void StartBlocking()
    {
        if (playerController == null) return;

        isBlocking = true;
        playerController.moveSpeed = baseSpeed * blockSpeedMultiplier;
        Debug.Log("Bloqueo activado (daño reducido, velocidad reducida).");
    }

    private void StopBlocking()
    {
        if (playerController == null) return;

        isBlocking = false;
        playerController.moveSpeed = baseSpeed;
        Debug.Log("Bloqueo desactivado.");
    }

    private IEnumerator PerformDash()
    {
        isDashing = true;
        
        // Obtenemos la dirección hacia donde mira el jugador o hacia donde se mueve
        // Para simplificar, usaremos la dirección del movimiento actual o la orientación del sprite
        Vector3 dashDirection = transform.forward;
        
        // Si hay una dirección de entrada de movimiento en curso, la usamos para el dash
        float horizontal = Input.GetAxisRaw("Horizontal");
        float vertical = Input.GetAxisRaw("Vertical");
        Vector3 inputDir = new Vector3(horizontal, 0f, vertical).normalized;

        if (inputDir.magnitude > 0.1f)
        {
            // Alinear con la perspectiva isométrica rotando 45 grados en Y
            Matrix4x4 isoMatrix = Matrix4x4.Rotate(Quaternion.Euler(0, 45, 0));
            dashDirection = isoMatrix.MultiplyPoint3x4(inputDir);
        }
        else
        {
            // Si el jugador está quieto, dashea en la última dirección que mira el sprite
            if (playerController != null && playerController.characterSprite != null)
            {
                // Si el sprite está volteado (flipX = true), miraba a la izquierda
                float side = playerController.characterSprite.flipX ? -1f : 1f;
                dashDirection = Matrix4x4.Rotate(Quaternion.Euler(0, 45, 0)).MultiplyPoint3x4(new Vector3(side, 0f, 0f));
            }
        }

        float startTime = Time.time;

        while (Time.time < startTime + dashDuration)
        {
            // Movemos el CharacterController a alta velocidad
            charController.Move(dashDirection.normalized * dashSpeed * Time.deltaTime);
            yield return null; // Esperamos al siguiente frame
        }

        isDashing = false;
    }

    // Dibuja el radio de ataque en la pestaña Scene de Unity para fácil depuración
    private void OnDrawGizmosSelected()
    {
        if (attackPoint == null) return;
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(attackPoint.position, attackRange);
    }
}
