extends Node2D


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta: float) -> void:
	pass

func _input(event):
	if event is InputEventMouseButton and event.pressed:
		var talking_screen = get_tree().root.get_node("root/talking_screen")
		self.hide()
		talking_screen.show()
