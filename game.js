kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1]
})

const MOVE_SPEED = 120

loadRoot('https://i.imgur.com/')
loadSprite('link-going-left', 'uQgMcy1.png')
loadSprite('link-going-right', 'ka5UNcJ.png')
loadSprite('link-going-down', '7jzFxtU.png')
loadSprite('link-going-up', 'yomuUgb.png')
loadSprite('left-wall', '2QvctFT.png')
loadSprite('top-wall', 'wk3Q3zb.png')
loadSprite('bottom-wall', 'rJeH77N.png')
loadSprite('right-wall', 'M3oZlgM.png')
loadSprite('bottom-left-wall', 'W0gPRxc.png')
loadSprite('bottom-right-wall', 'fHZvJWR.png')
loadSprite('top-left-wall', 'pY2EtpF.png')
loadSprite('top-right-wall', 'bCoU4Fp.jpg')
loadSprite('top-door', '5M3Un1u.png')
loadSprite('fire-pot', 'WUtxpCV.png')
loadSprite('left-door', 'HFzsVAX.png')
loadSprite('lanterns', 'MydOvDl.png')
loadSprite('slicer', 'LiSk0zB.png')
loadSprite('skeletor', 'kvuJ32J.png')
loadSprite('kaboom', 'mEsRi8t.png')
loadSprite('stairs', 'xBlzHE3.png')
loadSprite('grass', 'cNCOZNY.png')
loadSprite('hole', 'MvzkPdq.png')
loadSprite('sword', 'EyQj3UT.png')
loadSprite('bg', 'gDTeISE.png')


scene("game", ({ level , score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            'ycccccc^ccw',
            'a         b',
            'a       * b',
            'a     (   b',
            '%         b',
            'a     (   b',
            'a   *     b',
            'a         b',
            'xdd)dd)dddz',
        ], 
        [
            'ycccccccccw',
            'a         b',
            ')   }  }  )',
            'a         b',
            '%         b',
            'a     $   b',
            'a   }   } )',
            'a         b',
            'xdd)dd)dddz',
        ]
        
    ]

    const levelCfg = {
        width: 48,
        height: 48,
        a: [sprite('left-wall'), solid(), 'wall'],
        b: [sprite('right-wall'), solid(), 'wall'],
        c: [sprite('top-wall'), solid(), 'wall'],
        d: [sprite('bottom-wall'), solid(), 'wall'],
        w: [sprite('top-right-wall'), solid(), 'wall'],
        x: [sprite('bottom-left-wall'), solid(), 'wall'],
        y: [sprite('top-left-wall'), solid(), 'wall'],
        z: [sprite('bottom-right-wall'), solid(), 'wall'],
        '%': [sprite('left-door'), solid(), 'door'],
        '^': [sprite('top-door'), 'next-level'],
        $: [sprite('stairs'), 'next-level'],
        '*': [sprite('slicer'), 'slicer', { dir: -1 }, 'dangerous'],
        '}': [sprite('skeletor'), 'dangerous', 'skeletor', { dir: -1, timer: 0 }],
        ')': [sprite('lanterns'), solid(), 'wall'],
        '(': [sprite('fire-pot'), solid()],
      }
    addLevel(maps[level], levelCfg)

    add([sprite('bg'), layer('bg')])

    // add([sprite('bg'), layer('bg')])

    const scoreLabel = add([
        text('0'),
        pos(400,450),
        layer('ui'),
        {
            value: score,
        },
        scale(2)
    ])

    add([text('level ' + parseInt(level + 1)), pos(400, 485), scale(2)])

    const player = add([
        sprite('link-going-right'),
        pos(5, 190),
        {
            //right by default
            dir: vec2(1,0),
        }
    ])

    player.action(() => {
        player.resolve()
    })

    player.overlaps('next-level', () =>{
        go("game", {
            level: (level + 1) % maps.length, 
            score: scoreLabel.value
        })
    })

    keyDown('left', () => {
        player.changeSprite('link-going-left')
        player.move(-MOVE_SPEED, 0)
        player.dir = vec2(-1,0)
    })

    keyDown('right', () => {
        player.changeSprite('link-going-right')
        player.move(MOVE_SPEED, 0)
        player.dir = vec2(1,0)
    })

    keyDown('up', () => {
        player.changeSprite('link-going-up')
        player.move(0, -MOVE_SPEED)
        player.dir = vec2(0 ,-1)
    })

    keyDown('down', () => {
        player.changeSprite('link-going-down')
        player.move(0, MOVE_SPEED)
        player.dir = vec2(0, 1)
    })

    function spawnKaboom(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom'])
        wait(1, () => {
            destroy(obj)
        })
    }

    keyPress('space', () => {
        spawnKaboom(player.pos.add(player.dir.scale(48)))
    })

    player.collides('door', (d) => {
        destroy(d)
    })

    collides('kaboom', 'skeletor', ( k, s ) => {
        camShake(4)
        wait(1, () => {
            destroy(k)
        })
        destroy(s)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value 
    })



    const SLICER_SPEED = 200

    action('slicer', (s) => {
        s.move(s.dir * SLICER_SPEED, 0)
    })

    collides('slicer', 'wall', (s) => {
        s.dir = -s.dir
    })

    const SKELETOR_SPEED = 100

    action('skeletor', (s) => {
        s.move(0, s.dir * SKELETOR_SPEED)
        s.timer -= dt()
        if (s.timer <= 0) {
            s.dir = - s.dir
            s.timer = rand(5)
        }
    })

    collides('skeletor', 'wall', (s) => {
        s.dir = -s.dir
    })
    

    player.overlaps('dangerous', () => {
        go('lose', {score: 'Final Score: ' + (scoreLabel.value)})
    }) 
})

scene("lose", ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/ 2, height() /2)])
})

start("game", { level: 0, score: 0} )