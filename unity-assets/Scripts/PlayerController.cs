using UnityEngine;

/// <summary>
/// Controla el movimiento del jugador en una perspectiva isométrica 2.5D.
/// Requiere un componente CharacterController en el mismo GameObject.
/// </summary>
[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Ajustes de Movimiento")]
    [Tooltip("Velocidad de movimiento en unidades por segundo.")]
    public float moveSpeed = 5f;

    [Header("Referencias Visuales")]
    [Tooltip("El SpriteRenderer del objeto hijo que contiene los gráficos del personaje.")]
    public SpriteRenderer characterSprite;

    private CharacterController controller;
    private Vector3 moveDirection;
    
    // Matriz para rotar el input 45 grados y obtener movimiento isométrico real
    private Matrix4x4 isoMatrix;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        
        // Creamos una matriz de rotación de 45 grados en el eje Y (vertical)
        // Esto alinea el input W/A/S/D con la rejilla isométrica inclinada
        isoMatrix = Matrix4x4.Rotate(Quaternion.Euler(0, 45, 0));
    }

    void Update()
    {
        // 1. Obtener la entrada del teclado/mando
        // GetAxisRaw devuelve directamente -1, 0, o 1 (sin suavizado, ideal para pixel art)
        float horizontal = Input.GetAxisRaw("Horizontal");
        float vertical = Input.GetAxisRaw("Vertical");

        // 2. Crear el vector de entrada en el plano X-Z (horizontal y profundidad)
        Vector3 input = new Vector3(horizontal, 0f, vertical);
        
        // Normalizamos el vector para que movernos en diagonal no sea más rápido (ej: W+D)
        if (input.magnitude > 0.1f)
        {
            input = input.normalized;
        }

        // 3. Transformar el input a coordenadas isométricas
        moveDirection = isoMatrix.MultiplyPoint3x4(input);

        // 4. Mover al jugador
        // Multiplicamos por Time.deltaTime para que el movimiento sea independiente de los FPS
        controller.Move(moveDirection * moveSpeed * Time.deltaTime);

        // 5. Girar el sprite según la dirección horizontal del movimiento
        FlipSprite(horizontal);
    }

    /// <summary>
    /// Voltea el sprite en el eje X para mirar a la izquierda o derecha.
    /// </summary>
    private void FlipSprite(float horizontalInput)
    {
        if (characterSprite != null && horizontalInput != 0)
        {
            // Si la entrada es negativa (< 0), mirar a la izquierda
            // Si es positiva (> 0), mirar a la derecha (sin voltear)
            characterSprite.flipX = (horizontalInput < 0);
        }
    }
}
